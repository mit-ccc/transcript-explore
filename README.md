# transcript-explore

A prototype tool for exploring transcripts with accompanying audio

## Dev

Install dependencies

```
yarn
```

Start the dev server

```
yarn start
```

## Deployment

You can build via Docker Compose:

```
$ docker-compose build
...
```

To start a local staging deployment:

```
$ docker-compose up -d
```

Then open your browser to http://localhost:5000/transcript-explore/

To tear down the staging instance:

```
$ docker-compose down
```

To push to the remote repo:

```
$ docker-compose push
```

Deployment to `prototypes.lsm-mit.org` is handled via the lsm-cluster1
repo.
