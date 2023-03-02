# ipfs-api-proxy

This small proxy allows a more granular controler over the ipfs api.

## Features

- Filter file adds by mimetype
- Filter file adds by size
- Filter out directories
- Basic API key authentication
- Pinning on Pinning service if defined

## Environment Variables

| Variable               | Description                                                                 | Default                        |
| ---------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| PORT                   | Port the proxy listens on                                                   | 8000                           |
| LOG_LEVEL              | Loglevel                                                                    | ERROR                          |
| IPFS_BACKEND           | IPFS backend to forward requests to                                         | http://127.0.0.1:5001          |
| MAX_BODY_SIZE          | max total allowed body size (includes all files uploaded)                   | 1024 \* 1024 \* 10             |
| ALLOW_DIRECTORIES      | Allow to upload directories                                                 | false                          |
| ALLOWED_MIMETYPES      | Allowed MIMETypes                                                           | ['*']                          |
| ALLOWED_API_KEYS       | List of strings which are allowed to be used in the `X-API-KEY` HTTP header | []                             |
| IPFS_PINNING_SVC       | IPFS Pinning Service to use                                                 | "" // Fallback to IPFS backend |
| IPFS_PINNING_SVC_CREDS | Basic auth credentials to use in format `username:password`                 | ""                             |
