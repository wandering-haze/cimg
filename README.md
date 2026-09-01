<div align="center">
  <h1>~/wandering-haze/cimg</h1>
</div>

cimg is micro self-hostable image hosting service for Garry's Mod servers (and not only) allowing to gatekeep image uploading from malicious threat actors

## installation

steps were written with an assumption that user knows how to use linux, docker and nginx

1. rename `.env.example` to `.env`
2. configure `CIMG_ROOT_SECRET` and `CIMG_ELY_JWT_SECRET` *(tip: use openssl -rand hex 24)*
3. configure `domain.conf.example` to your needs
  - if you changed `CIMG_FS_MAX_SIZE` to some other value, you should change it in `.conf` file too!
4. move it to `/etc/nginx/conf.d` or wherever your subdomains/site configs are stored in
5. `docker compose up` and you should be done