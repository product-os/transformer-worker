
#  docuum

[Docuum](https://github.com/product-os/transformers-fleet/) is a Garbage Collector we use to remove the least recently used (LRU) transformer images from the `transformer-worker`.

It continuously monitors the Docker events and kicks in once the disk usage is above a given threshold.
