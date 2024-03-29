# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.18.51](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.51) (2021-10-27)

# v0.24.28
## (2023-05-31)

* Update flowzone.yml [Kyle Harding]

# v0.24.27
## (2022-12-13)

* CI: Remove renovate config [Josh Bowling]

# v0.24.26
## (2022-11-20)

* Update alpine Docker tag to v3.17 [renovate[bot]]

# v0.24.25
## (2022-10-13)

* logshipper: bump to version 1.0.1+rev3. [Carlo Miguel F. Cruz]
* logshipper: bump to version 1.0.1+rev2. [Carlo Miguel F. Cruz]

# v0.24.24
## (2022-10-13)

* Bump logshipper to v1.0.0+rev6. [Carlo Miguel F. Cruz]

# v0.24.23
## (2022-10-12)

* Push release to balena using Flowzone. [Carlo Miguel F. Cruz]

# v0.24.22
## (2022-04-19)

* logshipper: use logshipper balenablock. [Carlo Miguel F. Cruz]

# v0.24.21
## (2022-04-15)

* logshipper: fixup enum issue for vector protocol version. [Carlo Miguel F. Cruz]

# v0.24.20
## (2022-04-15)

* logshipper: parse only YAML files. [Carlo Miguel F. Cruz]

# v0.24.19
## (2022-04-15)

* logshipper: fixup config parsing. [Carlo Miguel F. Cruz]

# v0.24.18
## (2022-04-15)

* logshipper: switch back to directory parsing. [Carlo Miguel F. Cruz]

# v0.24.17
## (2022-04-15)

* logshipper: fixup config validation. [Carlo Miguel F. Cruz]
* logshipper: only parse YAML config files. [Carlo Miguel F. Cruz]

# v0.24.16
## (2022-04-15)

* logshipper: only parse YAML config files. [Carlo Miguel F. Cruz]

# v0.24.15
## (2022-04-15)

* logshipper: refactor start script and fixup docs. [Carlo Miguel F. Cruz]

# v0.24.14
## (2022-04-15)

* logshipper: cleanup startup approach. Use config-dir. [Carlo Miguel F. Cruz]
* logshipper: switch back to config-dir. [Carlo Miguel F. Cruz]

# v0.24.13
## (2022-04-15)

* logshipper: switch back to config-dir. [Carlo Miguel F. Cruz]

# v0.24.12
## (2022-04-15)

* logshipper: remove any test config files and reference only YAML. [Carlo Miguel F. Cruz]

# v0.24.11
## (2022-04-15)

* logshipper: revert to use list of config files. [Carlo Miguel F. Cruz]
* logshipper: disable compression. [Carlo Miguel F. Cruz]

# v0.24.10
## (2022-04-15)

* logshipper: disable compression. [Carlo Miguel F. Cruz]

# v0.24.9
## (2022-04-15)

* logshipper: use config dir instead of indiviual config files. [Carlo Miguel F. Cruz]

# v0.24.8
## (2022-04-15)

* logshipper: temporarily disable config validation. [Carlo Miguel F. Cruz]
* logshipper: remove Vector sink batch configuration. [Carlo Miguel F. Cruz]

# v0.24.7
## (2022-04-15)

* logshipper: remove Vector sink batch configuration. [Carlo Miguel F. Cruz]

# v0.24.6
## (2022-04-15)

* logshipper: Upgrade to Vector v0.21.0. [Carlo Miguel F. Cruz]

# v0.24.5
## (2022-04-15)

* logshipper: add gettext and updated config to balena image. [Carlo Miguel F. Cruz]

# v0.24.4
## (2022-04-15)

* logshipper: downgrade Vector to v0.18.1. [Carlo Miguel F. Cruz]

# v0.24.3
## (2022-04-06)

* Update transformer-runtime from 1.5.0 to 1.5.1 [Thomas Manning]

# v0.24.2
## (2022-04-05)

* Add logging for process events [Thomas Manning]

# v0.24.1
## (2022-04-05)

* Update jellyscript from 4.9.163 to 7.0.4 and fix already broken tests [Thomas Manning]
* Remove secrets handling tests that were migrated to transformer-runtime [Thomas Manning]

# v0.24.0
## (2022-04-05)

* Remove repo.yml to rely on transformers versioning [Thomas Manning]

# v0.23.8
## (2022-02-21)

* Add logging for backflow [Thomas Manning]

# v0.23.7
## (2022-02-09)

* Increase runner logging resolution to aid debugging [Thomas Manning]

# v0.23.6
## (2022-02-08)

* Add Github workflow to push to the production fleet. [Carlo Miguel F. Cruz]

# v0.23.5
## (2022-02-05)

* Update external-non-major [Renovate Bot]

# v0.23.4
## (2022-01-25)

* patch: Update external-non-major [Renovate Bot]

# v0.23.3
## (2022-01-25)

* fix logging of commit contracts [Martin Rauscher]

# v0.23.2
## (2022-01-19)

* fix TS after enabling esModuleInterop [Martin Rauscher]
* pass down log context to runtime [Martin Rauscher]

# v0.23.1
## (2022-01-18)

* workaround late stream binding of child loggers [Martin Rauscher]

# v0.23.0
## (2022-01-18)

* add lint commit hook [Martin Rauscher]
* fix and improve runner docker build [Martin Rauscher]
* add lint rule: don't use console.log [Martin Rauscher]
* switch to structured logging [Martin Rauscher]

# v0.22.5
## (2022-01-17)

* patch: Update dependency @balena/transformer-runtime to ^1.5.0 [Renovate Bot]

# v0.22.4
## (2022-01-12)

* mention secret's base64 encoding in docs [Martin Rauscher]

# v0.22.3
## (2022-01-10)

* restoring gitsecrets [Martin Rauscher]

# v0.22.2
## (2022-01-08)

* patch: Update external-non-major [Renovate Bot]

# v0.22.1
## (2022-01-07)

* ensure slug-suffix doesn't propagate [Martin Rauscher]

# v0.22.0
## (2022-01-07)

* create error contracts for system failures [Martin Rauscher]

# v0.21.2
## (2022-01-07)

* logshipper: Vector rollback to v0.18.1. [Carlo Miguel F. Cruz]

# v0.21.1
## (2022-01-05)

* ensure backflow uses full contracts or fails [Martin Rauscher]

# v0.21.0
## (2022-01-05)

* default output contract's name to parent's [Martin Rauscher]
* fix: secrets docs had wrong field [Martin Rauscher]

# v0.20.24
## (2022-01-01)

* patch: Update dependency @types/node to ^14.18.4 [Renovate Bot]

# v0.20.23
## (2022-01-01)

* patch: Update external-non-major [Renovate Bot]

# v0.20.22
## (2021-12-26)

* patch: Update dependency @types/node to ^14.18.3 [Renovate Bot]

# v0.20.21
## (2021-12-25)

* patch: Update dependency @types/node to ^14.18.2 [Renovate Bot]

# v0.20.20
## (2021-12-18)

* patch: Update dependency @balena/jellyfish-jellyscript to ^4.9.163 [Renovate Bot]

# v0.20.19
## (2021-12-18)

* patch: Update dependency @balena/jellyfish-jellyscript to ^4.9.162 [Renovate Bot]

# v0.20.18
## (2021-12-18)

* patch: Update internal-patch [Renovate Bot]

# v0.20.17
## (2021-12-18)

* patch: Update external-non-major [Renovate Bot]

# v0.20.16
## (2021-12-17)

* patch: Update dependency @balena/jellyfish-jellyscript to ^4.9.160 [Renovate Bot]

# v0.20.15
## (2021-12-15)

* Update 05-secrets.md [Martin Rauscher]

# v0.20.14
## (2021-12-14)

* improve docs [Martin Rauscher]

# v0.20.13
## (2021-12-14)

* Update PKI docs for linux/macos compatibility [danthegoodman1]

# v0.20.12
## (2021-12-14)

* patch: Update dependency @balena/jellyfish-jellyscript to ^4.9.158 [Renovate Bot]

# v0.20.11
## (2021-12-14)

* patch: Update internal-patch [Renovate Bot]

# v0.20.10
## (2021-12-11)

* patch: Update dependency @balena/jellyfish-jellyscript to ^4.9.156 [Renovate Bot]

# v0.20.9
## (2021-12-11)

* patch: Update internal-patch [Renovate Bot]

# v0.20.8
## (2021-12-11)

* patch: Update internal-patch [Renovate Bot]

# v0.20.7
## (2021-12-11)

* patch: Update external-non-major [Renovate Bot]

# v0.20.6
## (2021-12-10)

* fix types after runtime update [Martin Rauscher]

# v0.20.5
## (2021-12-10)

* patch: Update dependency @balena/transformer-runtime to ^1.4.4 [Renovate Bot]

# v0.20.4
## (2021-12-10)

* patch: Update dependency @balena/transformer-runtime to ^1.4.3 [Renovate Bot]

# v0.20.3
## (2021-12-10)

* patch: Update dependency @balena/transformer-runtime to ^1.4.2 [Renovate Bot]

# v0.20.2
## (2021-12-10)

* patch: Update dependency @balena/transformer-runtime to ^1.4.1 [Renovate Bot]

# v0.20.1
## (2021-12-10)

* bump version [Dan Goodman]

# v0.20.0
## (2021-12-08)

* reflect name changes of contracts in contract-repos [Martin Rauscher]

# v0.19.25
## (2021-12-07)

* patch: Update internal-patch [Renovate Bot]

# v0.19.24
## (2021-12-06)

* Remove logging supervisor API label. [Carlo Miguel F. Cruz]

# v0.19.23
## (2021-12-06)

* patch: Update dependency @balena/transformer-runtime to ^1.4.0 [Renovate Bot]

# v0.19.22
## (2021-12-04)

* patch: Update external-non-major [Renovate Bot]

# v0.19.21
## (2021-12-04)

* patch: Update internal-patch [Renovate Bot]

# v0.19.20
## (2021-12-01)

* allow creation of type@latest contracts [Martin Rauscher]

# v0.19.19
## (2021-12-01)

* patch: Update dependency @balena/jellyfish-jellyscript to ^4.9.143 [Renovate Bot]

# v0.19.18
## (2021-12-01)

* Removed no longer needed npm build secret [Paul Jonathan Zoulin]
* Add balena.yml to repo [Paul Jonathan Zoulin]

# v0.19.17
## (2021-11-30)

* Add balena.yml to repo [Paul Jonathan Zoulin]

# v0.19.16
## (2021-11-29)

* patch: Update internal-patch [Renovate Bot]

# v0.19.15
## (2021-11-27)

* patch: Update dependency @balena/jellyfish-jellyscript to ^4.9.140 [Renovate Bot]

# v0.19.14
## (2021-11-27)

* patch: Update dependency @balena/jellyfish-jellyscript to ^4.9.139 [Renovate Bot]

# v0.19.13
## (2021-11-27)

* patch: Update internal-patch [Renovate Bot]

# v0.19.12
## (2021-11-27)

* patch: Update external-non-major [Renovate Bot]

# v0.19.11
## (2021-11-26)

* patch: Update dependency @balena/jellyfish-jellyscript to ^4.9.137 [Renovate Bot]

# v0.19.10
## (2021-11-26)

* patch: Update dependency @balena/jellyfish-client-sdk to ^7.0.20 [Renovate Bot]

# v0.19.9
## (2021-11-26)

* patch: Update internal-patch [Renovate Bot]

# v0.19.8
## (2021-11-26)

* patch: Update dependency @balena/lint to ^6.2.0 [Renovate Bot]

# v0.19.7
## (2021-11-26)

* patch: Update internal-patch [Renovate Bot]

# v0.19.6
## (2021-11-25)

* patch: Update internal-patch [Renovate Bot]

# v0.19.5
## (2021-11-25)

* patch: Update dependency typescript to ^4.5.2 [Renovate Bot]

# v0.19.4
## (2021-11-25)

* patch: Update dependency @balena/jellyfish-client-sdk to v7 [Renovate Bot]

# v0.19.3
## (2021-11-25)

* Use product-os/renovate-config [Josh Bowling]

# v0.19.2
## (2021-11-18)

* put code under AGPL [Martin Rauscher]

# v0.19.1
## (2021-11-12)

* ensure backflowed data considers latest formula updates [Martin Rauscher]
* add commit sha to release tags [Martin Rauscher]
* use device-uuid as fleet identifier [Martin Rauscher]
* create dir for parent contract [Martin Rauscher]

# v0.19.0
## (2021-11-09)

* remove broken contract [Martin Rauscher]
* get parent version as secondary input [Martin Rauscher]
* linter cleanup and TS 4.4 fixes [Martin Rauscher]
* update deps [Martin Rauscher]

### [0.18.50](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.50) (2021-10-27)

### [0.18.49](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.49) (2021-10-27)

### [0.18.48](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.48) (2021-10-26)

### [0.18.47](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.47) (2021-10-26)

### [0.18.46](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.46) (2021-10-19)

### [0.18.45](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.45) (2021-10-18)

### [0.18.44](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.44) (2021-10-18)

### [0.18.43](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.43) (2021-10-11)

### [0.18.42](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.42) (2021-10-04)

### [0.18.41](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.41) (2021-10-04)

### [0.18.40](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.40) (2021-10-01)

### [0.18.39](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.39) (2021-09-28)

### [0.18.38](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.38) (2021-09-28)

### [0.18.37](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.37) (2021-09-28)

### [0.18.36](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.36) (2021-09-28)

### [0.18.35](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.35) (2021-09-27)

### [0.18.34](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.34) (2021-09-27)

### [0.18.33](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.33) (2021-09-23)

### [0.18.32](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.32) (2021-09-22)

### [0.18.31](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.31) (2021-09-22)

### [0.18.30](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.30) (2021-09-22)

### [0.18.29](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.29) (2021-09-22)

### [0.18.28](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.28) (2021-09-22)

### [0.18.27](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.27) (2021-09-22)

### [0.18.26](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.26) (2021-09-22)

### [0.18.25](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.25) (2021-09-08)

### [0.18.24](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.24) (2021-08-20)

### [0.18.23](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.23) (2021-08-20)

### [0.18.22](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.22) (2021-08-19)

### [0.18.21](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.21) (2021-08-19)

### [0.18.20](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.20) (2021-08-16)

### [0.18.19](https://github.com/product-os/transformer-worker/compare/v0.18.18...v0.18.19) (2021-08-06)

### [0.18.18](https://github.com/product-os/transformer-worker/compare/v0.18.17...v0.18.18) (2021-07-19)

# Change Log

All notable changes to this project will be documented in this file
automatically by Versionist. DO NOT EDIT THIS FILE MANUALLY!
This project adheres to [Semantic Versioning](http://semver.org/).

# v0.18.17
## (2021-05-13)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.4.1 [Renovate Bot]

# v0.18.16
## (2021-05-12)

* patch: Update dependency @types/node to ^14.14.45 [Renovate Bot]

# v0.18.15
## (2021-05-12)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.190 [Renovate Bot]

# v0.18.14
## (2021-05-12)

* patch: Update non-major [Renovate Bot]

# v0.18.13
## (2021-05-12)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.189 [Renovate Bot]

# v0.18.12
## (2021-05-11)

* patch: Update non-major [Renovate Bot]

# v0.18.11
## (2021-05-11)

* fix new-lines in encrypted content [Martin Rauscher]

# v0.18.10
## (2021-05-10)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.187 [Renovate Bot]

# v0.18.9
## (2021-05-10)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.173 [Renovate Bot]

# v0.18.8
## (2021-05-10)

* patch: Update dependency @balena/jellyfish-types to ^0.5.115 [Renovate Bot]

# v0.18.7
## (2021-05-08)

* patch: Update non-major [Renovate Bot]

# v0.18.6
## (2021-05-08)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.185 [Renovate Bot]

# v0.18.5
## (2021-05-08)

* patch: Update dependency @balena/jellyfish-types to ^0.5.114 [Renovate Bot]

# v0.18.4
## (2021-05-08)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.171 [Renovate Bot]

# v0.18.3
## (2021-05-08)

* patch: Update dependency eslint to ^7.26.0 [Renovate Bot]

# v0.18.2
## (2021-05-08)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.184 [Renovate Bot]

# v0.18.1
## (2021-05-08)

* patch: Update non-major [Renovate Bot]

# v0.18.0
## (2021-05-07)

* allow Transformers to NOT produce results [Martin Rauscher]
* fix pushing to balena - ignoring our balena.yml [Martin Rauscher]
* allow transformers to work without artifacts [Martin Rauscher]

# v0.17.72
## (2021-05-07)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.169 [Renovate Bot]

# v0.17.71
## (2021-05-06)

* patch: Update golang Docker tag to v1.16.4 [Renovate Bot]

# v0.17.70
## (2021-05-06)

* patch: Update dependency fs-extra to v10 [Renovate Bot]

# v0.17.69
## (2021-05-06)

* add manifest support [Martin Rauscher]
* fix: lockfile race-conditions [Martin Rauscher]
* don't log credentials [Martin Rauscher]

# v0.17.68
## (2021-05-06)

* patch: Update non-major [Renovate Bot]

# v0.17.67
## (2021-05-05)

* patch: Update non-major [Renovate Bot]

# v0.17.66
## (2021-05-05)

* ensure we don't lose tasks while offline [Martin Rauscher]
* ensure we compare existing contracts only on /data [Martin Rauscher]

# v0.17.65
## (2021-05-05)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.179 [Renovate Bot]

# v0.17.64
## (2021-05-05)

* patch: Update non-major [Renovate Bot]

# v0.17.63
## (2021-05-05)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.177 [Renovate Bot]

# v0.17.62
## (2021-05-05)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.166 [Renovate Bot]

# v0.17.61
## (2021-05-05)

* patch: Update dependency @balena/jellyfish-types to ^0.5.110 [Renovate Bot]

# v0.17.60
## (2021-05-05)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.176 [Renovate Bot]

# v0.17.59
## (2021-05-05)

* patch: Update non-major [Renovate Bot]

# v0.17.58
## (2021-05-04)

* patch: Update non-major [Renovate Bot]

# v0.17.57
## (2021-05-04)

* patch: Update non-major [Renovate Bot]

# v0.17.56
## (2021-05-04)

* patch: Update non-major [Renovate Bot]

# v0.17.55
## (2021-05-04)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.161 [Renovate Bot]

# v0.17.54
## (2021-05-04)

* patch: Update non-major [Renovate Bot]

# v0.17.53
## (2021-05-04)

* patch: Update dependency @balena/jellyfish-types to ^0.5.97 [Renovate Bot]

# v0.17.52
## (2021-05-04)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.152 [Renovate Bot]

# v0.17.51
## (2021-05-04)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.164 [Renovate Bot]

# v0.17.50
## (2021-05-04)

* patch: Update dependency @balena/jellyfish-types to ^0.5.96 [Renovate Bot]

# v0.17.49
## (2021-05-04)

* patch: Update non-major [Renovate Bot]

# v0.17.48
## (2021-05-03)

* patch: Update non-major [Renovate Bot]

# v0.17.47
## (2021-05-03)

* patch: Update dependency @balena/jellyfish-types to ^0.5.94 [Renovate Bot]

# v0.17.46
## (2021-05-03)

* patch: Update non-major [Renovate Bot]

# v0.17.45
## (2021-05-03)

* patch: Update non-major [Renovate Bot]

# v0.17.44
## (2021-05-03)

* patch: Update non-major [Renovate Bot]

# v0.17.43
## (2021-05-03)

* patch: Update non-major [Renovate Bot]

# v0.17.42
## (2021-05-03)

* patch: Update non-major [Renovate Bot]

# v0.17.41
## (2021-05-03)

* patch: Update non-major [Renovate Bot]

# v0.17.40
## (2021-05-03)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.156 [Renovate Bot]

# v0.17.39
## (2021-05-03)

* patch: Update non-major [Renovate Bot]

# v0.17.38
## (2021-05-03)

* patch: Update dependency @balena/jellyfish-types to ^0.5.86 [Renovate Bot]

# v0.17.37
## (2021-05-03)

* patch: Update non-major [Renovate Bot]

# v0.17.36
## (2021-05-03)

* patch: Update non-major [Renovate Bot]

# v0.17.35
## (2021-05-02)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.153 [Renovate Bot]

# v0.17.34
## (2021-05-02)

* patch: Update dependency @balena/jellyfish-types to ^0.5.84 [Renovate Bot]

# v0.17.33
## (2021-05-02)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.138 [Renovate Bot]

# v0.17.32
## (2021-05-02)

* patch: Update non-major [Renovate Bot]

# v0.17.31
## (2021-05-02)

* patch: Update non-major [Renovate Bot]

# v0.17.30
## (2021-05-02)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.150 [Renovate Bot]

# v0.17.29
## (2021-05-02)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.136 [Renovate Bot]

# v0.17.28
## (2021-05-02)

* patch: Update non-major [Renovate Bot]

# v0.17.27
## (2021-05-02)

* patch: Update non-major [Renovate Bot]

# v0.17.26
## (2021-05-01)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.149 [Renovate Bot]

# v0.17.25
## (2021-05-01)

* patch: Update non-major [Renovate Bot]

# v0.17.24
## (2021-05-01)

* patch: Update non-major [Renovate Bot]

# v0.17.23
## (2021-05-01)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.132 [Renovate Bot]

# v0.17.22
## (2021-05-01)

* patch: Update non-major [Renovate Bot]

# v0.17.21
## (2021-05-01)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.131 [Renovate Bot]

# v0.17.20
## (2021-05-01)

* patch: Update dependency @balena/jellyfish-types to ^0.5.76 [Renovate Bot]

# v0.17.19
## (2021-05-01)

* patch: Update non-major [Renovate Bot]

# v0.17.18
## (2021-05-01)

* patch: Update non-major [Renovate Bot]

# v0.17.17
## (2021-05-01)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.129 [Renovate Bot]

# v0.17.16
## (2021-05-01)

* patch: Update non-major [Renovate Bot]

# v0.17.15
## (2021-05-01)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.128 [Renovate Bot]

# v0.17.14
## (2021-04-30)

* patch: Update non-major [Renovate Bot]

# v0.17.13
## (2021-04-30)

* ensure updates don't interrupt tasks [Martin Rauscher]

# v0.17.12
## (2021-04-30)

* patch: Update non-major [Renovate Bot]

# v0.17.11
## (2021-04-30)

* patch: Update non-major [Renovate Bot]

# v0.17.10
## (2021-04-30)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.140 [Renovate Bot]

# v0.17.9
## (2021-04-30)

* patch: Update non-major [Renovate Bot]

# v0.17.8
## (2021-04-30)

* patch: Update non-major [Renovate Bot]

# v0.17.7
## (2021-04-29)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.122 [Renovate Bot]

# v0.17.6
## (2021-04-29)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.138 [Renovate Bot]

# v0.17.5
## (2021-04-29)

* patch: Update non-major [Renovate Bot]

# v0.17.4
## (2021-04-29)

* patch: Update dependency @balena/jellyfish-types to ^0.5.67 [Renovate Bot]

# v0.17.3
## (2021-04-29)

* patch: Update non-major [Renovate Bot]

# v0.17.2
## (2021-04-29)

* patch: Update non-major [Renovate Bot]

# v0.17.1
## (2021-04-29)

* patch: Update non-major [Renovate Bot]

# v0.17.0
## (2021-04-29)

* add support for slug suffixes this allows the transfomrer to get some control over the auto-generated slugs. This is helpful e.g. when creating multiple instances of the same type (like "service-image" for multiple architectures) [Martin Rauscher]
* fix: concurrent run shared the same tmpfs volume [Martin Rauscher]
* add CPU arch emulation for cross-compilation [Martin Rauscher]

# v0.16.215
## (2021-04-29)

* patch: Update non-major [Renovate Bot]

# v0.16.214
## (2021-04-29)

* patch: Update non-major [Renovate Bot]

# v0.16.213
## (2021-04-29)

* patch: Update non-major [Renovate Bot]

# v0.16.212
## (2021-04-29)

* patch: Update non-major [Renovate Bot]

# v0.16.211
## (2021-04-27)

* patch: Update dependency @types/node to ^14.14.43 [Renovate Bot]

# v0.16.210
## (2021-04-27)

* Set artifactReady with ISO date string instead of bool [Scott Lowe]

# v0.16.209
## (2021-04-27)

* patch: Update non-major [Renovate Bot]

# v0.16.208
## (2021-04-27)

* patch: Update non-major [Renovate Bot]

# v0.16.207
## (2021-04-26)

* patch: Update non-major [Renovate Bot]

# v0.16.206
## (2021-04-26)

* patch: Update non-major [Renovate Bot]

# v0.16.205
## (2021-04-26)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.109 [Renovate Bot]

# v0.16.204
## (2021-04-26)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.124 [Renovate Bot]

# v0.16.203
## (2021-04-26)

* patch: Update dependency @balena/jellyfish-types to ^0.5.55 [Renovate Bot]

# v0.16.202
## (2021-04-26)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.123 [Renovate Bot]

# v0.16.201
## (2021-04-26)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.108 [Renovate Bot]

# v0.16.200
## (2021-04-26)

* patch: Update non-major [Renovate Bot]

# v0.16.199
## (2021-04-25)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.107 [Renovate Bot]

# v0.16.198
## (2021-04-25)

* patch: Update dependency @balena/jellyfish-types to ^0.5.53 [Renovate Bot]

# v0.16.197
## (2021-04-25)

* patch: Update dependency dockerode to ^3.3.0 [Renovate Bot]

# v0.16.196
## (2021-04-25)

* patch: Update non-major [Renovate Bot]

# v0.16.195
## (2021-04-24)

* patch: Update non-major [Renovate Bot]

# v0.16.194
## (2021-04-24)

* patch: Update non-major [Renovate Bot]

# v0.16.193
## (2021-04-24)

* patch: Update non-major [Renovate Bot]

# v0.16.192
## (2021-04-24)

* patch: Update non-major [Renovate Bot]

# v0.16.191
## (2021-04-23)

* patch: Update non-major [Renovate Bot]

# v0.16.190
## (2021-04-23)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.115 [Renovate Bot]

# v0.16.189
## (2021-04-23)

* patch: Update dependency @balena/jellyfish-types to ^0.5.46 [Renovate Bot]

# v0.16.188
## (2021-04-23)

* patch: Update non-major [Renovate Bot]

# v0.16.187
## (2021-04-23)

* patch: Update non-major [Renovate Bot]

# v0.16.186
## (2021-04-23)

* patch: Update non-major [Renovate Bot]

# v0.16.185
## (2021-04-23)

* patch: Update non-major [Renovate Bot]

# v0.16.184
## (2021-04-22)

* patch: Update non-major [Renovate Bot]

# v0.16.183
## (2021-04-21)

* patch: Update non-major [Renovate Bot]

# v0.16.182
## (2021-04-21)

* patch: Update non-major [Renovate Bot]

# v0.16.181
## (2021-04-21)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.93 [Renovate Bot]

# v0.16.180
## (2021-04-21)

* patch: Update non-major [Renovate Bot]

# v0.16.179
## (2021-04-21)

* patch: Update non-major [Renovate Bot]

# v0.16.178
## (2021-04-21)

* patch: Update dependency @balena/jellyfish-types to ^0.5.34 [Renovate Bot]

# v0.16.177
## (2021-04-20)

* patch: Update non-major [Renovate Bot]

# v0.16.176
## (2021-04-20)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.87 [Renovate Bot]

# v0.16.175
## (2021-04-20)

* patch: Update non-major [Renovate Bot]

# v0.16.174
## (2021-04-20)

* patch: Update dependency @balena/jellyfish-types to ^0.5.31 [Renovate Bot]

# v0.16.173
## (2021-04-19)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.85 [Renovate Bot]

# v0.16.172
## (2021-04-19)

* patch: Update non-major [Renovate Bot]

# v0.16.171
## (2021-04-19)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.84 [Renovate Bot]

# v0.16.170
## (2021-04-19)

* patch: Update non-major [Renovate Bot]

# v0.16.169
## (2021-04-18)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.103 [Renovate Bot]

# v0.16.168
## (2021-04-18)

* patch: Update non-major [Renovate Bot]

# v0.16.167
## (2021-04-18)

* patch: Update non-major [Renovate Bot]

# v0.16.166
## (2021-04-18)

* patch: Update non-major [Renovate Bot]

# v0.16.165
## (2021-04-18)

* patch: Update non-major [Renovate Bot]

# v0.16.164
## (2021-04-18)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.79 [Renovate Bot]

# v0.16.163
## (2021-04-18)

* patch: Update non-major [Renovate Bot]

# v0.16.162
## (2021-04-18)

* patch: Update non-major [Renovate Bot]

# v0.16.161
## (2021-04-17)

* patch: Update non-major [Renovate Bot]

# v0.16.160
## (2021-04-17)

* patch: Update non-major [Renovate Bot]

# v0.16.159
## (2021-04-17)

* patch: Update non-major [Renovate Bot]

# v0.16.158
## (2021-04-17)

* patch: Update non-major [Renovate Bot]

# v0.16.157
## (2021-04-17)

* patch: Update dependency @balena/jellyfish-types to ^0.5.19 [Renovate Bot]

# v0.16.156
## (2021-04-17)

* patch: Update non-major [Renovate Bot]

# v0.16.155
## (2021-04-17)

* patch: Update non-major [Renovate Bot]

# v0.16.154
## (2021-04-17)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.92 [Renovate Bot]

# v0.16.153
## (2021-04-17)

* patch: Update dependency @balena/jellyfish-types to ^0.5.17 [Renovate Bot]

# v0.16.152
## (2021-04-17)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.71 [Renovate Bot]

# v0.16.151
## (2021-04-17)

* patch: Update non-major [Renovate Bot]

# v0.16.150
## (2021-04-17)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.90 [Renovate Bot]

# v0.16.149
## (2021-04-17)

* patch: Update non-major [Renovate Bot]

# v0.16.148
## (2021-04-17)

* patch: Update non-major [Renovate Bot]

# v0.16.147
## (2021-04-17)

* patch: Update non-major [Renovate Bot]

# v0.16.146
## (2021-04-16)

* patch: Update non-major [Renovate Bot]

# v0.16.145
## (2021-04-16)

* patch: Update dependency @balena/jellyfish-types to ^0.5.12 [Renovate Bot]

# v0.16.144
## (2021-04-16)

* patch: Update non-major [Renovate Bot]

# v0.16.143
## (2021-04-16)

* patch: Update non-major [Renovate Bot]

# v0.16.142
## (2021-04-16)

* patch: Update dependency @balena/jellyfish-types to ^0.5.10 [Renovate Bot]

# v0.16.141
## (2021-04-16)

* Add support for transformer secrets [Scott Lowe]

# v0.16.140
## (2021-04-16)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.84 [Renovate Bot]

# v0.16.139
## (2021-04-16)

* patch: Update non-major [Renovate Bot]

# v0.16.138
## (2021-04-16)

* patch: Update non-major [Renovate Bot]

# v0.16.137
## (2021-04-16)

* patch: Update non-major [Renovate Bot]

# v0.16.136
## (2021-04-16)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.81 [Renovate Bot]

# v0.16.135
## (2021-04-16)

* patch: Update non-major [Renovate Bot]

# v0.16.134
## (2021-04-15)

* patch: Update dependency @balena/jellyfish-types to ^0.5.5 [Renovate Bot]

# v0.16.133
## (2021-04-15)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.59 [Renovate Bot]

# v0.16.132
## (2021-04-15)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.79 [Renovate Bot]

# v0.16.131
## (2021-04-15)

* patch: Update non-major [Renovate Bot]

# v0.16.130
## (2021-04-15)

* patch: Update non-major [Renovate Bot]

# v0.16.129
## (2021-04-15)

* patch: Update dependency @balena/jellyfish-types to ^0.5.2 [Renovate Bot]

# v0.16.128
## (2021-04-15)

* patch: Update non-major [Renovate Bot]

# v0.16.127
## (2021-04-15)

* patch: Update non-major [Renovate Bot]

# v0.16.126
## (2021-04-15)

* patch: Update non-major [Renovate Bot]

# v0.16.125
## (2021-04-15)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.53 [Renovate Bot]

# v0.16.124
## (2021-04-15)

* patch: Update non-major [Renovate Bot]

# v0.16.123
## (2021-04-14)

* patch: Update non-major [Renovate Bot]

# v0.16.122
## (2021-04-14)

* patch: Update non-major [Renovate Bot]

# v0.16.121
## (2021-04-14)

* patch: Update dependency @balena/jellyfish-types to ^0.4.68 [Renovate Bot]

# v0.16.120
## (2021-04-14)

* patch: Update non-major [Renovate Bot]

# v0.16.119
## (2021-04-14)

* patch: Update non-major [Renovate Bot]

# v0.16.118
## (2021-04-14)

* patch: Update non-major [Renovate Bot]

# v0.16.117
## (2021-04-14)

* patch: Update dependency @balena/jellyfish-types to ^0.4.64 [Renovate Bot]

# v0.16.116
## (2021-04-14)

* patch: Update non-major [Renovate Bot]

# v0.16.115
## (2021-04-14)

* patch: Update non-major [Renovate Bot]

# v0.16.114
## (2021-04-14)

* patch: Update non-major [Renovate Bot]

# v0.16.113
## (2021-04-14)

* patch: Update non-major [Renovate Bot]

# v0.16.112
## (2021-04-13)

* patch: Update non-major [Renovate Bot]

# v0.16.111
## (2021-04-13)

* patch: Update non-major [Renovate Bot]

# v0.16.110
## (2021-04-13)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.38 [Renovate Bot]

# v0.16.109
## (2021-04-13)

* patch: Update non-major [Renovate Bot]

# v0.16.108
## (2021-04-13)

* patch: Update non-major [Renovate Bot]

# v0.16.107
## (2021-04-12)

* patch: Update non-major [Renovate Bot]

# v0.16.106
## (2021-04-12)

* patch: Update dependency @balena/jellyfish-types to ^0.4.56 [Renovate Bot]

# v0.16.105
## (2021-04-12)

* patch: Update non-major [Renovate Bot]

# v0.16.104
## (2021-04-12)

* fix after JF TypeScript conversion [Martin Rauscher]

# v0.16.103
## (2021-04-12)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.60 [Renovate Bot]

# v0.16.102
## (2021-04-12)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.34 [Renovate Bot]

# v0.16.101
## (2021-04-12)

* patch: Update non-major [Renovate Bot]

# v0.16.100
## (2021-04-12)

* patch: Update non-major [Renovate Bot]

# v0.16.99
## (2021-04-12)

* patch: Update non-major [Renovate Bot]

# v0.16.98
## (2021-04-12)

* patch: Update non-major [Renovate Bot]

# v0.16.97
## (2021-04-12)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.30 [Renovate Bot]

# v0.16.96
## (2021-04-12)

* patch: Update non-major [Renovate Bot]

# v0.16.95
## (2021-04-12)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.28 [Renovate Bot]

# v0.16.94
## (2021-04-12)

* patch: Update non-major [Renovate Bot]

# v0.16.93
## (2021-04-11)

* patch: Update non-major [Renovate Bot]

# v0.16.92
## (2021-04-11)

* patch: Update non-major [Renovate Bot]

# v0.16.91
## (2021-04-11)

* patch: Update non-major [Renovate Bot]

# v0.16.90
## (2021-04-11)

* patch: Update non-major [Renovate Bot]

# v0.16.89
## (2021-04-11)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.51 [Renovate Bot]

# v0.16.88
## (2021-04-11)

* patch: Update dependency @balena/jellyfish-types to ^0.4.44 [Renovate Bot]

# v0.16.87
## (2021-04-11)

* patch: Update non-major [Renovate Bot]

# v0.16.86
## (2021-04-11)

* patch: Update non-major [Renovate Bot]

# v0.16.85
## (2021-04-11)

* patch: Update non-major [Renovate Bot]

# v0.16.84
## (2021-04-11)

* patch: Update non-major [Renovate Bot]

# v0.16.83
## (2021-04-11)

* patch: Update non-major [Renovate Bot]

# v0.16.82
## (2021-04-11)

* patch: Update non-major [Renovate Bot]

# v0.16.81
## (2021-04-10)

* patch: Update non-major [Renovate Bot]

# v0.16.80
## (2021-04-10)

* patch: Update non-major [Renovate Bot]

# v0.16.79
## (2021-04-10)

* patch: Update non-major [Renovate Bot]

# v0.16.78
## (2021-04-10)

* patch: Update dependency @balena/jellyfish-types to ^0.4.35 [Renovate Bot]

# v0.16.77
## (2021-04-10)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.14 [Renovate Bot]

# v0.16.76
## (2021-04-10)

* patch: Update dependency @balena/jellyfish-types to ^0.4.34 [Renovate Bot]

# v0.16.75
## (2021-04-10)

* patch: Update non-major [Renovate Bot]

# v0.16.74
## (2021-04-10)

* patch: Update dependency @balena/jellyfish-types to ^0.4.33 [Renovate Bot]

# v0.16.73
## (2021-04-10)

* patch: Update non-major [Renovate Bot]

# v0.16.72
## (2021-04-10)

* patch: Update non-major [Renovate Bot]

# v0.16.71
## (2021-04-10)

* patch: Update dependency @balena/jellyfish-types to ^0.4.31 [Renovate Bot]

# v0.16.70
## (2021-04-10)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.40 [Renovate Bot]

# v0.16.69
## (2021-04-10)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.10 [Renovate Bot]

# v0.16.68
## (2021-04-10)

* patch: Update dependency @balena/jellyfish-types to ^0.4.30 [Renovate Bot]

# v0.16.67
## (2021-04-10)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.39 [Renovate Bot]

# v0.16.66
## (2021-04-10)

* patch: Update non-major [Renovate Bot]

# v0.16.65
## (2021-04-10)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.8 [Renovate Bot]

# v0.16.64
## (2021-04-09)

* patch: Update non-major [Renovate Bot]

# v0.16.63
## (2021-04-07)

* patch: Update non-major [Renovate Bot]

# v0.16.62
## (2021-04-07)

* patch: Update non-major [Renovate Bot]

# v0.16.61
## (2021-04-07)

* patch: Update non-major [Renovate Bot]

# v0.16.60
## (2021-04-06)

* patch: Update non-major [Renovate Bot]

# v0.16.59
## (2021-04-06)

* patch: Update non-major [Renovate Bot]

# v0.16.58
## (2021-04-06)

* patch: Update dependency @balena/jellyfish-types to ^0.4.24 [Renovate Bot]

# v0.16.57
## (2021-04-06)

* patch: Update non-major [Renovate Bot]

# v0.16.56
## (2021-04-06)

* patch: Update dependency @balena/jellyfish-types to ^0.4.23 [Renovate Bot]

# v0.16.55
## (2021-04-06)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.2.2 [Renovate Bot]

# v0.16.54
## (2021-04-06)

* patch: Update dependency @balena/jellyfish-types to ^0.4.22 [Renovate Bot]

# v0.16.53
## (2021-04-06)

* patch: Update non-major [Renovate Bot]

# v0.16.52
## (2021-04-04)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.1.18 [Renovate Bot]

# v0.16.51
## (2021-04-04)

* patch: Update non-major [Renovate Bot]

# v0.16.50
## (2021-04-04)

* patch: Update dependency @balena/jellyfish-client-sdk to ^3.1.17 [Renovate Bot]

# v0.16.49
## (2021-04-04)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.30 [Renovate Bot]

# v0.16.48
## (2021-04-04)

* patch: Update non-major [Renovate Bot]

# v0.16.47
## (2021-04-04)

* patch: Update non-major [Renovate Bot]

# v0.16.46
## (2021-04-04)

* patch: Update dependency @balena/jellyfish-types to ^0.4.17 [Renovate Bot]

# v0.16.45
## (2021-04-04)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.27 [Renovate Bot]

# v0.16.44
## (2021-04-04)

* patch: Update non-major [Renovate Bot]

# v0.16.43
## (2021-04-03)

* patch: Update non-major [Renovate Bot]

# v0.16.42
## (2021-04-03)

* patch: Update non-major [Renovate Bot]

# v0.16.41
## (2021-04-02)

* patch: Update non-major [Renovate Bot]

# v0.16.40
## (2021-04-02)

* patch: Update non-major [Renovate Bot]

# v0.16.39
## (2021-04-02)

* patch: Update non-major [Renovate Bot]

# v0.16.38
## (2021-04-02)

* patch: Update non-major [Renovate Bot]

# v0.16.37
## (2021-04-02)

* use JF SDK's new TypeScript support [Martin Rauscher]

# v0.16.36
## (2021-04-02)

* patch: Update dependency @balena/jellyfish-client-sdk to v3 [Renovate Bot]

# v0.16.35
## (2021-04-02)

* prevent zombie processes from Transformers [Martin Rauscher]
* fix and simplify docuum setup [Martin Rauscher]

# v0.16.34
## (2021-04-02)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.19 [Renovate Bot]

# v0.16.33
## (2021-04-02)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.18 [Renovate Bot]

# v0.16.32
## (2021-04-02)

* patch: Update golang Docker tag to v1.16.3 [Renovate Bot]

# v0.16.31
## (2021-04-01)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.17 [Renovate Bot]

# v0.16.30
## (2021-03-31)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.16 [Renovate Bot]

# v0.16.29
## (2021-03-31)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.15 [Renovate Bot]

# v0.16.28
## (2021-03-30)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.14 [Renovate Bot]

# v0.16.27
## (2021-03-29)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.13 [Renovate Bot]

# v0.16.26
## (2021-03-28)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.12 [Renovate Bot]

# v0.16.25
## (2021-03-27)

* patch: Update dependency @types/node to ^14.14.37 [Renovate Bot]

# v0.16.24
## (2021-03-27)

* patch: Update dependency eslint to ^7.23.0 [Renovate Bot]

# v0.16.23
## (2021-03-26)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.11 [Renovate Bot]

# v0.16.22
## (2021-03-26)

* use docker-volume for temporary docker storage (too big for RAM) [Martin Rauscher]

# v0.16.21
## (2021-03-26)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.9 [Renovate Bot]

# v0.16.20
## (2021-03-25)

* patch: Update non-major [Renovate Bot]

# v0.16.19
## (2021-03-25)

* patch: Update non-major [Renovate Bot]

# v0.16.18
## (2021-03-25)

* patch: Update dependency @balena/jellyfish-client-sdk to ^2.19.1 [Renovate Bot]

# v0.16.17
## (2021-03-25)

* improve logging [Martin Rauscher]
* fix transformer bugs [Martin Rauscher]

# v0.16.16
## (2021-03-25)

* fix transformer bugs [Martin Rauscher]

# v0.16.15
## (2021-03-25)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.5 [Renovate Bot]

# v0.16.14
## (2021-03-25)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.4 [Renovate Bot]

# v0.16.13
## (2021-03-24)

* patch: Update dependency @balena/jellyfish-jellyscript to ^3.0.1 [Renovate Bot]

# v0.16.12
## (2021-03-24)

* Adds micah@balena.io to git-secrets [ab77]

# v0.16.11
## (2021-03-24)

* Move NPM_TOKEN to build stage [ab77]

# v0.16.10
## (2021-03-24)

* add generic-source example [Martin Rauscher]
* fix missing id/slug for newly created contract repos [Martin Rauscher]

# v0.16.9
## (2021-03-24)

* add secret handling [Martin Rauscher]

# v0.16.8
## (2021-03-24)

* patch: Update dependency @balena/jellyfish-jellyscript to v3 [Renovate Bot]

# v0.16.7
## (2021-03-23)

* Replace empty build args with encrypted value [ab77]

# v0.16.6
## (2021-03-23)

* Add contract to specify this is a balenaCloud app [ab77]

# v0.16.5
## (2021-03-23)

* patch: Update dependency @balena/jellyfish-client-sdk to ^2.19.0 [Renovate Bot]

# v0.16.4
## (2021-03-22)

* Adds secrets handling infrastructure [ab77]

# v0.16.3
## (2021-03-22)

* patch: Update dependency @balena/jellyfish-jellyscript to ^2.1.62 [Renovate Bot]

# v0.16.2
## (2021-03-22)

* fix: name of repo contained undefined [Martin Rauscher]

# v0.16.1
## (2021-03-22)

* add deploy script [Martin Rauscher]

# v0.16.0
## (2021-03-22)

* Simplify backflow mapping interface [Scott Lowe]

# v0.15.3
## (2021-03-22)

* patch: Update dependency @balena/jellyfish-jellyscript to ^2.1.61 [Renovate Bot]

# v0.15.2
## (2021-03-21)

* patch: Update dependency @balena/jellyfish-jellyscript to ^2.1.60 [Renovate Bot]

# v0.15.1
## (2021-03-18)

* patch: Update dependency @balena/jellyfish-jellyscript to ^2.1.59 [Renovate Bot]

# v0.15.0
## (2021-03-18)

* Add support for formulas in backflow [Scott Lowe]

# v0.14.9
## (2021-03-18)

* patch: Update dependency typescript to v4 [Renovate Bot]

# v0.14.8
## (2021-03-17)

* patch: Update dependency ts-node to v9 [Renovate Bot]

# v0.14.7
## (2021-03-17)

* patch: Update non-major [Renovate Bot]

# v0.14.6
## (2021-03-17)

* patch: Update golang Docker tag to v1.16.2 [Renovate Bot]

# v0.14.5
## (2021-03-17)

* Add renovate config [Josh Bowling]

# v0.14.4
## (2021-03-16)

* fix backflow source value reading 🥔 [Martin Rauscher]

# v0.14.3
## (2021-03-16)

* fix type handling for output contracts [Martin Rauscher]

# v0.14.2
## (2021-03-16)

* Copy base slug from input->output Set deterministic slug for output Do upsert instead of insert when storing output [Scott Lowe]

# v0.14.1
## (2021-03-16)

* fix missing ID for links and broken stdout piping [Martin Rauscher]

# v0.14.0
## (2021-03-15)

* Add backflow mechanism [Scott Lowe]

# v0.13.0
## (2021-03-12)

* add transformer output to their contract-repositories [Martin Rauscher]

# v0.12.3
## (2021-03-09)

* don't buffer docker stdout/stderr [Martin Rauscher]

# v0.12.2
## (2021-03-08)

* fix image tagging [Martin Rauscher]
* disable link creation as it fails without SDK adaptions [Martin Rauscher]
* unify artifact reference handling [Martin Rauscher]
* update oras [Martin Rauscher]

# v0.12.1
## (2021-03-05)

* don't fail if status data didn't exist before the task run [Martin Rauscher]

# v0.12.0
## (2021-03-04)

* Add output contract links [Scott Lowe]

# v0.11.1
## (2021-03-03)

* fix status query for tasks [Martin Rauscher]
* fix default registry must be empty [Martin Rauscher]

# v0.11.0
## (2021-03-01)

* Implement task status changes [Scott Lowe]

# v0.10.1
## (2021-02-25)

* fix user->username rename [Martin Rauscher]

# v0.10.0
## (2021-02-25)

* add error handling for invalid results [Martin Rauscher]
* Support pushing images from transformers [Scott Lowe]

# v0.9.2
## (2021-02-25)

* fix compose to run on prod again [Martin Rauscher]

# v0.9.1
## (2021-02-24)

* move "reflect-cli" to productOS repo [Martin Rauscher]

# v0.9.0
## (2021-02-24)

* remove obsolete dev services from main compose file [Martin Rauscher]
* remove unexpected default port for registry [Martin Rauscher]
* make local end2end flow work [Martin Rauscher]
* add fleet containers to compose and share JF token for auth [Martin Rauscher]
* fleet: automatically setup enrollment secret [Martin Rauscher]
* add worker filter to transformer definition [Martin Rauscher]
* Add initial implementation of the reflect CLI [Stevche Radevski]
* Add initial implementation of the reflect CLI [Stevche Radevski]
* make dev-artifact-provider login with JF and create contracts for artifacts [Martin Rauscher]

# v0.8.6
## (2021-02-16)

* Prepare runner for new registration flow / jf-auth [Scott Lowe]

# v0.8.5
## (2021-02-16)

* Move heartbeat into jellyfish module [Scott Lowe]

# v0.8.4
## (2021-02-16)

* Add docker-compose.dev.yml, tidy up [Scott Lowe]

# v0.8.3
## (2021-02-16)

* move artifactReady to $transformer namespace [Martin Rauscher]

# v0.8.2
## (2021-02-15)

* Remove unused JF mock inside the runner [Stevche Radevski]

# v0.8.1
## (2021-02-11)

* remove (and warn) in/out directory if leftover from previous crash [Martin Rauscher]

# v0.8.0
## (2021-02-10)

* cleanup split of runner and registry code [Martin Rauscher]

# v0.7.0
## (2021-02-09)

* Add a couple of comments [Stevche Radevski]
* Do some refactoring in the runner, add few TODO comments [Stevche Radevski]

# v0.6.2
## (2021-02-08)

* Change to official dind image, remove comments [Stevche Radevski]

# v0.6.1
## (2021-02-08)

* revert to official docker:dind after upgrade to Alpine 3.13 [Martin Rauscher]

# v0.6.0
## (2021-02-04)

* first working version of runner [Martin Rauscher]

# v0.5.0
## (2021-02-04)

* Implement basic structure of stub server [Lucian Buzzo]

# v0.4.6
## (2021-02-04)

* simplify getting of device UUID [Martin Rauscher]

# v0.4.5
## (2021-02-04)

* Remove importing mock from inside runner [Stevche Radevski]

# v0.4.4
## (2021-02-03)

* Add pushArtifact implementation [Scott Lowe]

# v0.4.3
## (2021-02-03)

* add container that pre-loads artifacts into the registry [Martin Rauscher]

# v0.4.2
## (2021-02-03)

* Changes from conversation [Scott Lowe]

# v0.4.1
## (2021-02-02)

* catch async exceptions in task handling [Martin Rauscher]

# v0.4.0
## (2021-02-02)

* Push mock artifact to registry [Stevche Radevski]

# v0.3.2
## (2021-02-02)

* remove uneccessary permissions for registry container [Martin Rauscher]

# v0.3.1
## (2021-02-02)

* Use dind for the transformer runner [Stevche Radevski]

# v0.3.0
## (2021-02-01)

* Add sanity-check validation for tasks [Scott Lowe]

# v0.2.0
## (2021-02-01)

* Add output manifest validation [Scott Lowe]

# v0.1.7
## (2021-02-01)

* Use single dockerode instance in runner [Scott Lowe]

# v0.1.6
## (2021-01-29)

* Remove MOCK_JS_SDK default [Scott Lowe]

# v0.1.5
## (2021-01-29)

* simplify dockerfile [Martin Rauscher]

# v0.1.4
## (2021-01-29)

* Rename artefact->artifact [Scott Lowe]

# v0.1.3
## (2021-01-29)

* Remove broken login retry mechanism [Scott Lowe]

# v0.1.2
## (2021-01-29)

* Set up testing framework [Scott Lowe]

# v0.1.1
## (2021-01-28)

* Adapt runner-transformer interface for manifests [Scott Lowe]

# v0.1.0
## (2021-01-28)

* Add repo.yml [Giovanni Garufi]
* Add ORAS to Dockerfile for runner [Stevche Radevski]
* Update README.md [Tomas Tormo]
* Add .balena.yml and cleanup [Tomás Tormo]
* Initial commit [Tomás Tormo]
