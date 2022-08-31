---
layout: post
title:  "Node replacement on Openshift 4!"
date:   2022-08-31 10:10:29 +0200
categories: openshift4
---
In the following post, we are going to talk on how to perform a node replacement (control or worker node) of OCPv4.10.25.

Prerequisites

- OCPv4.10.X installed using AssistedInstaller or IPI.



Step 1. How to change the `unmanaged` state of the nodes after the Assisted Installer finished

Those operations are required to be performed as a day2 to bring the BareMetalHost object status of each nodes of the OCPv4.10 cluster from `unmanaged` to `externally provisioned`.

To highlight this, we are going to use a compact cluster (3 control nodes + 0 worker nodes).

{% highlight bash %}
oc get nodes
NAME         STATUS   ROLES           AGE    VERSION
cu-master1   Ready    master,worker   138m   v1.23.5+012e945
cu-master2   Ready    master,worker   152m   v1.23.5+012e945
cu-master3   Ready    master,worker   159m   v1.23.5+012e945
{% endhighlight %}

The BMH object status:
{% highlight bash %}
oc get bmh -n openshift-machine-api
NAME         STATE                    CONSUMER                      ONLINE   ERROR   AGE
cu-master1   unmanaged                test-cluster-xkmdh-master-0   true             3h12m
cu-master2   unmanaged                test-cluster-xkmdh-master-1   true             3h12m
cu-master3   unmanaged                test-cluster-xkmdh-master-2   true             3h12m
{% endhighlight %}

As you can observe in the above BMH object the `STATE` of each node its in the `unmanaged`, we will have to update this object to be managed in order to have the cluster ready for the node replacement.

We will have to create the secret and update the `address`, `credentialsName` and set `disableCertificateVerification: true` for each individual nodes.

- cu-master1:

{% highlight bash %}
---
apiVersion: v1
data:
  password: Y2Fsdmlu
  username: cm9vdA==
kind: Secret
metadata:
  name: cu-master1-bmc-secret
  namespace: openshift-machine-api
type: Opaque
---
apiVersion: metal3.io/v1alpha1
kind: BareMetalHost
metadata:
  name: cu-master1
  namespace: openshift-machine-api
spec:
  automatedCleaningMode: metadata
  bmc:
    address: idrac-virtualmedia://192.168.34.230/redfish/v1/Systems/System.Embedded.1
    credentialsName: cu-master1-bmc-secret
    disableCertificateVerification: true
  bootMACAddress: b0:7b:25:d4:e8:20
  bootMode: UEFI
  online: true
{% endhighlight %}

- cu-master2:

{% highlight bash %}
---
apiVersion: v1
data:
  password: Y2Fsdmlu
  username: cm9vdA==
kind: Secret
metadata:
  name: cu-master2-bmc-secret
  namespace: openshift-machine-api
type: Opaque
---
apiVersion: metal3.io/v1alpha1
kind: BareMetalHost
metadata:
  name: cu-master2
  namespace: openshift-machine-api
spec:
  automatedCleaningMode: metadata
  bmc:
    address: idrac-virtualmedia://192.168.34.231/redfish/v1/Systems/System.Embedded.1
    credentialsName: cu-master3-bmc-secret
    disableCertificateVerification: true
  bootMACAddress: b0:7b:25:dd:ce:be
  bootMode: UEFI
  online: true
{% endhighlight %}

- cu-master3:

{% highlight bash %}
---
apiVersion: v1
data:
  password: Y2Fsdmlu
  username: cm9vdA==
kind: Secret
metadata:
  name: cu-master3-bmc-secret
  namespace: openshift-machine-api
type: Opaque
---
apiVersion: metal3.io/v1alpha1
kind: BareMetalHost
metadata:
  name: cu-master3
  namespace: openshift-machine-api
spec:
  automatedCleaningMode: metadata
  bmc:
    address: idrac-virtualmedia://192.168.34.232/redfish/v1/Systems/System.Embedded.1
    credentialsName: cu-master3-bmc-secret
    disableCertificateVerification: true
  bootMACAddress: b0:7b:25:d4:59:80
  bootMode: UEFI
  online: true
{% endhighlight %}

Apply the objects for each nodes:

{% highlight bash %}
oc apply -f update-masterX-bmh.yaml
secret/cu-masterX-bmc-secret created
Warning: resource baremetalhosts/cu-masterX is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by oc apply. oc apply should only be used on resources created declaratively by either oc create --save-config or oc apply. The missing annotation will be patched automatically.
baremetalhost.metal3.io/cu-masterX configured
{% endhighlight %}

Step 2. Verify that the BMH object has been updated

- Verify that the secrets associated to each node has been created:
  
{% highlight bash %}
oc get secrets -n openshift-machine-api
NAME                                              TYPE                                  DATA   AGE
...
cu-master1-bmc-secret                             Opaque                                2      104m
cu-master2-bmc-secret                             Opaque                                2      102m
cu-master3-bmc-secret                             Opaque                                2      15s
...
{% endhighlight %}

- Verify that the BMH object state has been updated:

{% highlight bash %}
oc get bmh -n openshift-machine-api
NAME         STATE                    CONSUMER                      ONLINE   ERROR   AGE
cu-master1   externally provisioned   test-cluster-xkmdh-master-0   true             3h25m
cu-master2   externally provisioned   test-cluster-xkmdh-master-1   true             3h25m
cu-master3   externally provisioned   test-cluster-xkmdh-master-2   true             3h25m
{% endhighlight %}

Once those steps are fully completed without errors, you can proceed further on the cluster usage.


Step 3. ETCD cluster back-up procedure

[etcd-backup]: https://docs.openshift.com/container-platform/4.10/backup_and_restore/control_plane_backup_and_restore/backing-up-etcd.html

For more informations regarding the [ETCD cluster back-up procedure from Redhat][etcd-backup].

Please, note that the ETCD cluster back-up can be proceed when the cluster is healthy and also when one of the node is been lost. In the following example, we are going to cover when one of the node has been lost, but the steps wont be changed in the other scenario.

Display the nodes in the cluster:
{% highlight bash %}
oc get nodes
NAME                                         STATUS      ROLES           AGE   VERSION
kni1-master-0.cloud.lab.eng.bos.redhat.com   Ready       master,worker   8d    v1.21.11+6b3cbdd
kni1-master-1.cloud.lab.eng.bos.redhat.com   Ready       master,worker   8d    v1.21.11+6b3cbdd
kni1-master-2.cloud.lab.eng.bos.redhat.com   NotReady    master,worker   99m   v1.21.11+6b3cbdd
{% endhighlight %}

Connect to one of the nodes in the cluster:
{% highlight bash %}
oc debug node/kni1-master-0.cloud.lab.eng.bos.redhat.com
Starting pod/kni1-master-0cloudlabengbosredhatcom-debug ...
To use host binaries, run `chroot /host`
Pod IP: 10.19.138.11
If you don't see a command prompt, try pressing enter.
sh-4.4#
sh-4.4#
sh-4.4# chroot /host
sh-4.4# /bin/bash
[systemd]
Failed Units: 1
  NetworkManager-wait-online.service
[root@kni1-master-0 /]# 
{% endhighlight %}

At this point we can run the back-up script available on the node:
{% highlight yaml %}
[root@kni1-master-0 /]# /usr/local/bin/cluster-backup.sh /home/core/assets/backup
found latest kube-apiserver: /etc/kubernetes/static-pod-resources/kube-apiserver-pod-15
found latest kube-controller-manager: /etc/kubernetes/static-pod-resources/kube-controller-manager-pod-9
found latest kube-scheduler: /etc/kubernetes/static-pod-resources/kube-scheduler-pod-8
found latest etcd: /etc/kubernetes/static-pod-resources/etcd-pod-11
2355b836ed2da7166a4deada628681d110131ccf58e6695e30a2e005a075d041
etcdctl version: 3.4.14
API version: 3.4
{"level":"info","ts":1654790640.5072594,"caller":"snapshot/v3_snapshot.go:119","msg":"created temporary db file","path":"/home/core/assets/backup/snapshot_2022-06-09_160359.db.part"}                            
{"level":"info","ts":"2022-06-09T16:04:00.515Z","caller":"clientv3/maintenance.go:200","msg":"opened snapshot stream; downloading"}                                                                               
{"level":"info","ts":1654790640.515958,"caller":"snapshot/v3_snapshot.go:127","msg":"fetching snapshot","endpoint":"https://10.19.138.13:2379"}                                                                   
{"level":"info","ts":"2022-06-09T16:04:01.395Z","caller":"clientv3/maintenance.go:208","msg":"completed snapshot read; closing"}                                                                                  
{"level":"info","ts":1654790641.4325762,"caller":"snapshot/v3_snapshot.go:142","msg":"fetched snapshot","endpoint":"https://10.19.138.13:2379","size":"138 MB","took":0.925249543}                                
{"level":"info","ts":1654790641.4326785,"caller":"snapshot/v3_snapshot.go:152","msg":"saved","path":"/home/core/assets/backup/snapshot_2022-06-09_160359.db"}                                                     
Snapshot saved at /home/core/assets/backup/snapshot_2022-06-09_160359.db
{"hash":2784831220,"revision":9953578,"totalKey":14626,"totalSize":137506816}
snapshot db and kube resources are successfully saved to /home/core/assets/backup
{% endhighlight %}


Validating that the backup files have been created and they do exist:
{% highlight bash %}
[root@kni1-master-0 /]# ls -l /home/core/assets/backup/
total 134364
-rw-------. 1 root root 137506848 Jun  9 16:04 snapshot_2022-06-09_160359.db
-rw-------. 1 root root     76154 Jun  9 16:03 static_kuberesources_2022-06-09_160359.tar.gz
{% endhighlight %}

At this stage we made sure that we have a current ETCD cluster backup available on a running node, this can be externally exported to your laptop or a external storage for data persistance. In the next steps, we are going to proceed with removing the unhealthy ETCD node in the cluster.

Step 4. Remove unhealthy ETCD cluster member

[etcd-remove-member]: https://docs.openshift.com/container-platform/4.10/backup_and_restore/control_plane_backup_and_restore/replacing-unhealthy-etcd-member.html#restore-replace-crashlooping-etcd-member_replacing-unhealthy-etcd-member

For more informations regarding the [remove of unhealthy ETCD cluster member procedure from Redhat][etcd-remove-member].

{% highlight bash %}
oc get nodes                                                                                               
NAME                                         STATUS     ROLES           AGE    VERSION
kni1-master-0.cloud.lab.eng.bos.redhat.com   Ready      master,worker   8d     v1.21.11+6b3cbdd
kni1-master-1.cloud.lab.eng.bos.redhat.com   Ready      master,worker   8d     v1.21.11+6b3cbdd
kni1-master-2.cloud.lab.eng.bos.redhat.com   NotReady   master,worker   113m   v1.21.11+6b3cbdd
{% endhighlight %}

Checking the ETCD pods on the cluster:
{% highlight bash %}
oc get pods -n openshift-etcd | grep -v etcd-quorum-guard | grep etcd                                                 
etcd-kni1-master-0.cloud.lab.eng.bos.redhat.com                   4/4     Running     0          53m
etcd-kni1-master-1.cloud.lab.eng.bos.redhat.com                   4/4     Running     0          56m
etcd-kni1-master-2.cloud.lab.eng.bos.redhat.com                   4/4     Running     0          56m
{% endhighlight %}

Connect to the pod that is not assigned of the node with `STATUS` `NotReady`:
{% highlight bash %}
oc project openshift-etcd                                                                                             
Already on project "openshift-etcd" on server "https://api.kni1.cloud.lab.eng.bos.redhat.com:6443".
{% endhighlight %}

{% highlight bash %}
oc rsh etcd-kni1-master-0.cloud.lab.eng.bos.redhat.com                                                                
Defaulted container "etcdctl" out of: etcdctl, etcd, etcd-metrics, etcd-health-monitor, setup (init), etcd-ensure-env-vars (init), etcd-resources-copy (init)                                                     
sh-4.4# 
{% endhighlight %}

Check the ETCD member list:
{% highlight bash %}
sh-4.4# etcdctl member list -w table
+------------------+---------+--------------------------------------------+---------------------------+---------------------------+------------+                                                                  
|        ID        | STATUS  |                    NAME                    |        PEER ADDRS         |       CLIENT ADDRS        | IS LEARNER |                                                                  
+------------------+---------+--------------------------------------------+---------------------------+---------------------------+------------+                                                                  
| 5b080c81fee5526d | started | kni1-master-0.cloud.lab.eng.bos.redhat.com | https://10.19.138.11:2380 | https://10.19.138.11:2379 |      false |                                                                  
| a863d615322849cb | started | kni1-master-1.cloud.lab.eng.bos.redhat.com | https://10.19.138.12:2380 | https://10.19.138.12:2379 |      false |                                                                  
| c05aa2adbc319032 | started | kni1-master-2.cloud.lab.eng.bos.redhat.com | https://10.19.138.13:2380 | https://10.19.138.13:2379 |      false |                                                                  
+------------------+---------+--------------------------------------------+---------------------------+---------------------------+------------+                                                                  
sh-4.4# 
{% endhighlight %}

Take note of the ID and the name of the unhealthy etcd member, because those values are needed later in the procedure.
{% highlight bash %}
sh-4.4# etcdctl endpoint health
{"level":"warn","ts":"2022-06-09T16:23:51.165Z","caller":"clientv3/retry_interceptor.go:62","msg":"retrying of unary invoker failed","target":"endpoint://client-1a51aaca-cf9d-4421-855c-fb19cfbfe07d/10.19.138.13:2379","attempt":0,"error":"rpc error: code = DeadlineExceeded desc = latest balancer error: all SubConns are in TransientFailure, latest connection error: connection error: desc = \"transport: Error while dialing dial tcp 10.19.138.13:2379: connect: connection refused\""}
https://10.19.138.11:2379 is healthy: successfully committed proposal: took = 12.718254ms
https://10.19.138.12:2379 is healthy: successfully committed proposal: took = 12.879825ms
https://10.19.138.13:2379 is unhealthy: failed to commit proposal: context deadline exceeded
Error: unhealthy cluster
{% endhighlight %}

Remove the unhealthy member:
{% highlight bash %}
sh-4.4# etcdctl member remove c05aa2adbc319032
{% endhighlight %}

View the member list again and verify that the member was removed:
{% highlight bash %}
sh-4.4# etcdctl member list -w table                                                                                                                                                                              
+------------------+---------+--------------------------------------------+---------------------------+---------------------------+------------+                                                                  
|        ID        | STATUS  |                    NAME                    |        PEER ADDRS         |       CLIENT ADDRS        | IS LEARNER |                                                                  
+------------------+---------+--------------------------------------------+---------------------------+---------------------------+------------+                                                                  
| 5b080c81fee5526d | started | kni1-master-0.cloud.lab.eng.bos.redhat.com | https://10.19.138.11:2380 | https://10.19.138.11:2379 |      false |                                                                  
| a863d615322849cb | started | kni1-master-1.cloud.lab.eng.bos.redhat.com | https://10.19.138.12:2380 | https://10.19.138.12:2379 |      false |                                                                                                                               
+------------------+---------+--------------------------------------------+---------------------------+---------------------------+------------+   
{% endhighlight %}

Once this is validated, please exit the node shell.

Remove the old secrets for the unhealthy etcd member that was removed.

List the secrets for the unhealthy etcd member that was removed:
{% highlight bash %}
oc get secrets -n openshift-etcd | grep kni1-master-2.cloud.lab.eng.bos.redhat.com                                   
etcd-peer-kni1-master-2.cloud.lab.eng.bos.redhat.com              kubernetes.io/tls                     2      81m                                                                                                
etcd-serving-kni1-master-2.cloud.lab.eng.bos.redhat.com           kubernetes.io/tls                     2      81m                                                                                                
etcd-serving-metrics-kni1-master-2.cloud.lab.eng.bos.redhat.com   kubernetes.io/tls                     2      81m   
{% endhighlight %}
