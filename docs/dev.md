# Deployment Documentation

Now to make a new deployment, simple make a commit that alters the `package.json` `version`
And on the commit use something like "Release 1.2.3"
More [examples](https://github.com/marketplace/actions/version-check).

```
git tag v1.0.0
git push origin v1.0.0
docker build -t spt:v1.0.0 .
docker tag spt:v1.0.0 ghcr.io/confused-techie/student-point-tracker:v1.0.0
docker push ghcr.io/confused-techie/student-point-tracker:v1.0.0
```


To upgrade the single container via Docker Compose once deployed:

```
nano docker-compose.yml
# Upgrade the version
sudo docker-compose pull
sudo docker-compose up -d --no-deps backend
```

`sudo docker logs spt_be`
