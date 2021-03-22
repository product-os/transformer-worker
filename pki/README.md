# PKI
> generate [RSA](https://jameshfisher.com/2017/03/21/openssl-public-key-encryption/) keys to store and communicate secrets securely

## ToC

* [generate encryption keys](#generate-encryption-keys)
* [encrypt](#encrypt)
* [decrypt](#decrypt)
* [configure balenaCloud app(s)](#configure-balenacloud-apps)


## generate encryption keys

    # generate server private key
    openssl genrsa -out private.key 2048
    chmod 0600 private.key

    # (optional) protect private key or use git-secrets.io
    openssl ec -in private.key -out private.key -aes256

    # extract public key
    openssl rsa -pubout -in private.key -out public.pem


## encrypt

    plaintext='foo-bar'

    encrypted="$(echo ${plaintext} \
      | openssl rsautl -encrypt -inkey public.pem -pubin -in - | openssl base64 -A)"


## decrypt

    echo "${encrypted}" | base64 -d | openssl rsautl -decrypt -inkey private.key -in -


## configure balenaCloud app

    balena_application=balena/product-os-transformers-workers
    
    balena_service=transformer-runner

    private_key="$(cat private.key | openssl base64 -A)"

    balena env add RSA_PRIVATE_KEY "${private_key}" \
      --application ${balena_application} \
      --service ${balena_service}


## example

    $ balena_device=$(balena devices --app ${balena_application} | head -n 2 | tail -n 1 | awk '{print $2}')
    
    $ balena ssh ${balena_device} ${balena_service}
    ...


    # encrypted='U7V4oauOB+JTryQW...vrrqG0jOy5o38w=='

    # echo "${RSA_PRIVATE_KEY}" | base64 -d > /dev/shm/private.key
    
    # echo "${encrypted}" | base64 -d | openssl rsautl -decrypt -inkey /dev/shm/private.key -in -
    foo-bar
