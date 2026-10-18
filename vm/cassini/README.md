# cassini

An Incus container that stands in for the Raspberry Pi 1 Model B+ we'll
eventually own. It runs the built Guided Reader fastify server, talking to the
Sun GraphQL backend on windcatcher.

Browse to **https://cassini:9178/**. The cert comes from mkcert, so run
`mkcert -install` once on the machine you browse from.

## Why it can't be a real Pi

The Pi 1 Model B+ is ARMv6 (BCM2835, ARM1176 at 700 MHz, 512 MB). Two things
stop a literal copy:

- LXC shares the host kernel and CPU architecture, so a container here is x86_64.
- Bun has no 32-bit ARM build. Guided Reader can't run on real Pi 1 silicon at all.

So cassini copies the *resources*, not the silicon: one CPU core, 512 MB RAM,
100 Mbit NIC, microSD-ish disk, 8 GB storage.

## Commands

    ./cassini.sh provision        # box: storage, network, limits, bun
    ./cassini.sh deploy           # build + push + restart the app
    ./cassini.sh deploy --skip-build
    ./cassini.sh status
    ./cassini.sh shell            # bash inside the container
    ./cassini.sh stop | start
    ./cassini.sh destroy          # delete the container, keep the pool image

Every knob is in `cassini.conf`. Change the CPU share, memory, ports or backend
URL there and re-run `provision` (hardware/network) and `deploy` (the app).

## How it fits together

    browser -> cassini:9178 -> Incus proxy -> cassini edge :5178 -> app :5179

- The Incus proxy device publishes host port 9178 into the container.
- The edge (`files/cassini-edge.ts`) terminates TLS with an mkcert cert and
  forwards to the app over plain http. It also sets `x-forwarded-proto: https`
  so the production hook in `@sun/ssr` doesn't 301 the request, and rewrites the
  Origin and Referer hostname to `localhost` so POSTs clear the hook's
  allow-list (`scarlettparker.co.uk`, `localhost`, `127.0.0.1`, `app`).
- The app binds 5179, reads `.env.production`, and calls the backend on
  `192.168.0.106:8083`.

Storage is a sparse 8 GiB ext4 image loop-mounted at `/srv/incus-pi`, registered
as the Incus pool `pi`. The filesystem size is the cap; nothing else enforces it.

## Host-side bits this touches

- `/etc/fstab` gets the loop mount.
- UFW gets three rules: container to host `:8083` and `:53`, and LAN to `:9178`.
- `/etc/hosts` gets `127.0.0.1 cassini`.

pihole already holds `:53` and `:67` on the host, so the Incus bridge runs with
DHCP and DNS off. The container gets a static `10.99.0.5` from its own
systemd-networkd config, and reaches the backend through the host.

## Quirks

- The disk throttle lives on the container's cgroup, which is recreated when the
  container restarts. Re-run `provision` after a restart to reapply it.
- `provision` and `deploy` issue the cert on the host with mkcert and push the
  pair into `/opt/cassini/tls/`. The local copies sit in `vm/cassini/tls/`, which
  is gitignored because the key is a private key.
- Once a browser visits the https URL it keeps an HSTS entry for `cassini`, so
  plain http stops working for that browser afterwards.
- `POSTHOG_API_KEY`/`POSTHOG_HOST` come out empty because Guided Reader's `.env`
  doesn't define them (the Sun `.env` does). Analytics stays off.
- `deploy` builds a dependencies-only `node_modules` on the host and ships it in,
  so the container never needs the private registry.
