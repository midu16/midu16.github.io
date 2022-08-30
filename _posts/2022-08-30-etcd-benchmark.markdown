---
layout: post
title:  "ETCD cluster benchmark for Openshift 4!"
date:   2022-08-30 10:10:29 +0200
categories: openshift4
---
In the following post, we are going to talk on how to perform a set of benchmark tests on the ETCD cluster of Openshift 4 with root disk over SAN.

Prerequisites

- OCPv4.10.X

Using the `etcdctl check perf` tool:

Step 1. Testing the ETCD

Before performing any ETCD benchmark testings please collect [oc must-gather][oc-must-gather] logs.

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


Step 3. Testing the ETCD with kube-burner

In this point we are going to extend the benchmark tool described on the Step 1 for the ETCD cluster on OCPv4.X.

Before performing any ETCD benchmark testings please collect [oc must-gather][oc-must-gather] logs.

Run the must-gather through the etcd.sh:
{% highlight bash %}
alias etcdcheck='podman run --privileged --volume /$(pwd):/test quay.io/peterducai/openshift-etcd-suite:latest etcd '
etcdcheck /test/<path to must-gather>
{% endhighlight %}

{% highlight bash %}
curl -L -O https://github.com/cloud-bulldozer/kube-burner/releases/download/v0.15.5/kube-burner-0.15.5-Linux-x86_64.tar.gz
tar xvfz kube-burner-0.15.5-Linux-x86_64.tar.gz
sudo mv kube-burner /usr/local/bin/
curl -L -O https://github.com/cloud-bulldozer/cluster-perf-ci/archive/refs/heads/master.zip
cd cluster-perf-ci/
{% endhighlight %}

At this point we will need to tune the workload file `configmap-scale.yaml` as described below:

{% highlight yaml %}
---
global:
  writeToFile: false
  requestTimeout: 15s
  indexerConfig:
    enabled: false
    esServers: ["https://search-perfscale-dev-chmf5l4sh66lvxbnadi4bznl3a.us-west-2.es.amazonaws.com"]
    defaultIndex: ripsaw-kube-burner
    type: elastic

jobs:
  - name: stage-1
    namespace: stage-1
    jobIterations: 1
    qps: 200
    burst: 200
    namespacedIterations: false
    podWait: false
    verifyObjects: false
    objects:
    - objectTemplate: "templates/configmap-scale/configmap.yml"
      #replicas: 20000
      replicas: 50000
      inputVars:
        # Data lenght is in bytes, 2000000 = 2MiB
        #data_length: 10000
        data_length: 10000

  - name: delete-stage-1
    waitForDeletion: true
    jobType: delete
    objects:
    - kind: Namespace
      labelSelector: {kube-burner-job: stage-1}
{% endhighlight %}

Running the `kube-kurner` service in a dedicated terminal:

{% highlight bash %}
oc project default
oc create sa kubeburner
oc adm policy add-cluster-role-to-user cluster-admin -z kubeburner
export TOKEN=$(oc sa get-token kubeburner)
kube-burner init -c configmap-scale.yml -t ${TOKEN} --uuid $(uuidgen)
{% endhighlight %}

Open a new terminal and run the following commands:

{% highlight bash %}
while true; do oc get configmap -n stage-1 | wc -l; done
{% endhighlight %}

Once those steps are finished and all the data has been collected, try to perform a [oc must-gather][oc-must-gather] logs collection.

Run the must-gather through the etcd.sh:
{% highlight bash %}
alias etcdcheck='podman run --privileged --volume /$(pwd):/test quay.io/peterducai/openshift-etcd-suite:latest etcd '
etcdcheck /test/<path to must-gather>
{% endhighlight %}

For more informations on the [etcd.sh][etcd-sh].

[fedora-doc]: https://docs.fedoraproject.org/en-US/quick-docs/raspberry-pi/
[oc-must-gather]: https://midu16.github.io/openshift4/2022/07/10/offline-must-gather.html

[etcd-sh]: https://github.com/peterducai/openshift-etcd-suite

Run the fio_suite:
{% highlight bash %}
podman run --privileged --volume /$(pwd):/test quay.io/peterducai/openshift-etcd-suite:latest fio
{% endhighlight %}
