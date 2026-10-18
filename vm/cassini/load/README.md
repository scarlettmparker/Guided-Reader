# cassini load testing

Drives realistic Guided Reader traffic against the cassini container with k6,
while sampling the container's own CPU and memory, so you can find how many
concurrent users it takes before latency or errors blow up.

The target is deliberately a fake Pi (one core at a 10% duty cycle, 512 MB), so
the numbers are about the app under Pi-like constraints, not about windcatcher.

## Prerequisites

- Docker (k6 runs as `grafana/k6` with `--network host`)
- Bun, psql (seed/nuke read the backend's datasource env)
- The cassini container up (`../cassini.sh status`)

`cassini` must resolve and the mkcert CA be trusted where you run this; the k6
script skips TLS verification anyway.

## Seed and nuke

    ./pg-env.sh && source ./pg-env.sh   # derive PG* from the backend env
    USERS=50 VIEWS=10 bun seed.ts       # create loadtest-1..50
    PREFIX=loadtest bun nuke.ts         # delete every loadtest-* row

Seeded accounts share one password (`loadtest-pass` by default) and each gets a
handful of viewed texts so the library is not empty. Seed nukes the prefix first,
so it is safe to re-run.

Everything the seed creates is namespaced by `PREFIX`, and nuke removes exactly
that: accounts, people, and anything they wrote (text views, positions,
annotations, comments, votes, notes).

## Run

    ./run.sh 50                     # 50 users, 30s
    DURATION=60s ./run.sh 50
    SWEEP="10 25 50 100" ./run.sh   # climb until it breaks

`run.sh` seeds, starts the sampler, runs k6, then collects the container's
journals. It prints a results table and leaves everything under
`runs/<timestamp>-<users>u/`.

### Knobs

| Variable         | Default      | Meaning                                    |
| ---------------- | ------------ | ------------------------------------------ |
| `USERS`          | `25`         | accounts to seed and VUs to run            |
| `DURATION`       | `30s`        | k6 run length                              |
| `WRITE_SHARE`    | `0.2`        | fraction of VUs that create/delete notes   |
| `THINK_MS`       | `300`        | pause between reader iterations            |
| `WRITE_THINK_MS` | `16000`      | pause between writer iterations            |
| `VIEWS`          | `10`         | seeded viewed texts per account            |
| `PREFIX`         | `loadtest`   | account/username prefix                    |
| `BASE_URL`       | edge URL     | where k6 points                            |

## What each VU does

Readers sign in, load the library, list texts, open one, fetch its annotations
and mark it viewed. Writers sign in, create an annotation on a text and delete it.

`createAnnotation` is rate limited to about one per 15s per account, which is why
writers default to a 16s pause. Lowering `WRITE_THINK_MS` trades correctness for
write pressure: you will see 429s and the error threshold will reflect that.

## What it measures

- `http_req_duration` split by `kind:read` / `kind:write`, with thresholds
  `p(95)<500ms` and `p(99)<1000ms`.
- `http_req_failed < 1%` and `checks > 99%`.
- The container's cgroup every second: CPU time, throttling, memory, OOM kills.

## Artefacts

    runs/<ts>-<n>u/
      k6.txt              full k6 console output (thresholds, percentiles)
      k6-summary.json     machine-readable k6 summary
      result.tsv          users, p95, p99, error%, checks%
      resources.csv       one row per second of container CPU/memory/OOM
      app.log             guided-reader journal for the run
      nginx.log           nginx journal for the run
      seed.txt            what the seed created
      meta.txt            commit, knobs, container limits, peak usage

The `runs/` directory is gitignored.

## Isolation

Nothing from the container can reach the host's resources: it is capped at one
CPU with a `10ms/100ms` allowance, 512 MiB hard memory with swap off, and an I/O
throttle. Under memory pressure it OOMs inside its own cgroup rather than
touching the host. `limit`/`peak`/`oom_kills` in `meta.txt` and `resources.csv`
show whether that held.

To raise the ceiling, edit `LIMITS_CPU`, `CPU_ALLOWANCE`, `MEMORY` or
`NET_RATE` in `../cassini.conf` and re-run `../cassini.sh provision`.
