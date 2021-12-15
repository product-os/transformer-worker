# Using secrets in Transformers

There are two kinds of secrets in the Transformer system:
* repo-level secrets, which you can place in your `balena.yml`
* loop-level secrets, which are added to Transformer installations that link a Transformer with a loop

In the Transformers system secrets are always encrypted and only decrypted during the runtime of a Transformer, therefore they are safe to be committed to your repositories.

Both kinds of secrets are encrypted and decrypted in the same way. The difference is only in which contracts you place them in where in your input manifest the Transformer will receive the decrypted value.

## Setting a repo-level secret

In your `balena.yml` the key `data.$transformer.encryptedSecrets` may contain an object with keys (or sub-objects) which are encrypted. E.g.
```yml
data:
  $transformer:
    encryptedSecrets:
      NPM_TOKEN: xxxxxxxxxxxxxxxxxxxxx
      more-stuff:
        db-key: xxxxxxxxxxxxxxxxxxxxx
        root-password: xxxxxxxxxxxxxxxxxxxxx
      
```

## Setting a loop-level secret

⚠️ We currently don't have Transformer installation yet. That means we only offer transformer-level secrets:

In the `balena.yml` of your Transformer the key `data.fragment.data.$transformer.encryptedSecrets` may contain an object with keys (or sub-objects) which are encrypted. E.g.
```yml
type: service-source
data:
  fragment:
    data:
    $transformer:
      encryptedSecrets:
        NPM_TOKEN: xxxxxxxxxxxxxxxxxxxxx
        more-stuff:
          db-key: xxxxxxxxxxxxxxxxxxxxx
          root-password: xxxxxxxxxxxxxxxxxxxxx
      
```

## Consuming secrets in a Transformer

The worker passes the decrypted secrets in separate fields of the input manifest to the Transformer, where you can just read them like this:

```javascript
const input = (await readInput(inputPath)).input;
const secrets = {
  ...input.decryptedTransformerSecrets,
  ...input.decryptedSecrets,
};
npm.doSomething(secrets.NPM_TOKEN);
```

## How to encrypt secrets

See [here](https://github.com/product-os/transformer-worker/tree/master/pki) to learn how to encrypt a secret before adding it to your contracts.
