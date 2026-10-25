# Reader VPS deploy

```sh
./vm/vps/deploy-reader.sh
./vm/vps/deploy-reader.sh --skip-build
```

Deploys the Guided Reader build to the `cassini` container and points it at the
Sun backend on `artemis`. Woodpecker runs this with `--skip-build` after its
build step.
