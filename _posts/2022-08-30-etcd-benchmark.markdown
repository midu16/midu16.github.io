---
layout: post
title:  "ETCD cluster benchmark for Openshift 4!"
date:   2022-08-30 10:10:29 +0200
categories: openshift4
---
In the following post, we are going to talk on how to perform a set of benchmark tests on the ETCD cluster of Openshift 4.

Prerequisites

- OCPv4.10.X

Using the `etcdctl check perf` tool:

Step 1. testing the ETCD

{% highlight bash %}
export ETCD_POD=$(oc -n openshift-etcd get pods -l app=etcd -o name | head -1)
{% endhighlight %}

- load = small

{% highlight bash %}
oc exec -n openshift-etcd -it -c etcd $ETCD_POD -- etcdctl check perf --load='s' --auto-compact=true --auto-defrag=true --command-timeout=10m
60 / 60 Boooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo! 100.00% 1m0s
Compacting with revision 8758230
Compacted with revision 8758230
Defragmenting "https://10.92.117.52:2379"
Defragmented "https://10.92.117.52:2379"
Defragmenting "https://10.92.117.53:2379"
Defragmented "https://10.92.117.53:2379"
Defragmenting "https://10.92.117.54:2379"
Defragmented "https://10.92.117.54:2379"
PASS: Throughput is 151 writes/s
PASS: Slowest request took 0.035363s
PASS: Stddev is 0.001403s
PASS
{% endhighlight %}

- load = medium

{% highlight bash %}
oc exec  -n openshift-etcd -it -c etcd $ETCD_POD -- etcdctl check perf --load='m' --auto-compact=true --auto-defrag=true --command-timeout=10m
 60 / 60 Boooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo! 100.00% 1m0s
Compacting with revision 8819152
Compacted with revision 8819152
Defragmenting "https://10.92.117.52:2379"
Defragmented "https://10.92.117.52:2379"
Defragmenting "https://10.92.117.53:2379"
Defragmented "https://10.92.117.53:2379"
Defragmenting "https://10.92.117.54:2379"
Defragmented "https://10.92.117.54:2379"
PASS: Throughput is 999 writes/s
PASS: Slowest request took 0.039985s
PASS: Stddev is 0.002749s
PASS
{% endhighlight %}

- load = large

{% highlight bash %}
oc exec  -n openshift-etcd -it -c etcd $ETCD_POD -- etcdctl check perf --load='l' --auto-compact=true --auto-defrag=true --command-timeout=10m
 60 / 60 Boooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo! 100.00% 1m0s
Compacting with revision 9235285
Compacted with revision 9235285
Defragmenting "https://10.92.117.52:2379"
Defragmented "https://10.92.117.52:2379"
Defragmenting "https://10.92.117.53:2379"
Defragmented "https://10.92.117.53:2379"
Defragmenting "https://10.92.117.54:2379"
Defragmented "https://10.92.117.54:2379"
FAIL: Throughput too low: 6918 writes/s
PASS: Slowest request took 0.132319s
PASS: Stddev is 0.004785s
FAIL
{% endhighlight %}

- load = extralarge

{% highlight bash %}
oc exec  -n openshift-etcd -it -c etcd $ETCD_POD -- etcdctl check perf --load='xl' --auto-compact=true --auto-defrag=true --command-timeout=10m
 60 / 60 Boooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo! 100.00% 1m0s
Compacting with revision 8747581
Compacted with revision 8747581
Defragmenting "https://10.92.117.52:2379"
Defragmented "https://10.92.117.52:2379"
Defragmenting "https://10.92.117.53:2379"
Defragmented "https://10.92.117.53:2379"
Defragmenting "https://10.92.117.54:2379"
Defragmented "https://10.92.117.54:2379"
FAIL: Throughput too low: 10821 writes/s
PASS: Slowest request took 0.048963s
PASS: Stddev is 0.005151s
FAIL
{% endhighlight %}

Step 2. The benchmark threshold results set by the upstream community

| Measure            | Threshold limit |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| Throughput         | < 150 * 0.9 writes/s (s) ; < 1000 * 0.9 writes/s (m) ; < 8000 * 0.9 writes/s (l) ; < 15000 * 0.9 writes/s (xl)  |
| Slowest request    | > 500 ms  |
| Standard deviation | > 100 ms  |


[fedora-doc]: https://docs.fedoraproject.org/en-US/quick-docs/raspberry-pi/
[srs-doc]:   https://docs.srsran.com/en/latest/app_notes/source/pi4/source/index.html
[uhd-doc]: https://files.ettus.com/manual/page_install.html
[srsenb]: https://github.com/midu16/midu16.github.io/blob/main/assets/binaries/srs/aarch64/srsenb
[srsepc]: https://github.com/midu16/midu16.github.io/blob/main/assets/binaries/srs/aarch64/srsepc
[srsepc_if_masq.sh]: https://github.com/midu16/midu16.github.io/blob/main/assets/binaries/srs/aarch64/srsepc_if_masq.sh
[srslte_install_configs.sh]:https://github.com/midu16/midu16.github.io/blob/main/assets/binaries/srs/aarch64/srslte_install_configs.sh
[usrp-doc-b]: https://www.ettus.com/product-categories/usrp-bus-series/
[usrp-doc-n]: https://www.ettus.com/product-categories/usrp-networked-series/
