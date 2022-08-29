---
layout: post
title:  "Offline mirroring tool comparison for Openshift 4!"
date:   2022-08-24 10:10:29 +0200
categories: openshift4
---
In the following post, we are going to talk on how to mirror the container base images locally first to an .tar file and later upload them to the offline registry on the Bastion Host.

Prerequisites

- OCPv4.10.X
- Redhat Enterprise Linux/Rocky Linux/Fedora 
- Downloaded pull-secret.txt file
- podman package available to the OS

Step 1. Downloading oc-cli and oc-mirror-cli to the Bastion Host:

- Download oc-cli:
{% highlight bash %}
export VERSION=stable-4.10
curl -s https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$VERSION/openshift-client-linux.tar.gz | tar zxvf - oc
sudo cp oc /usr/local/bin
{% endhighlight %}

- Download oc-mirror-cli:
{% highlight bash %}
export VERSION=stable-4.10
curl -s https://mirror.openshift.com/pub/openshift-v4/clients/ocp/$VERSION/oc-mirror.tar.gz | tar zxvf - oc-mirror
sudo cp oc-mirror /usr/local/bin
{% endhighlight %}

Step 2. Creating the redhat-operator-index container 

{% highlight bash %}
podman run -d --name redhat-operator-index-4.10 -p 5051:5051 -it registry.redhat.io/redhat/redhat-operator-index:v4.10
cd ${HOME}/.config/user/systemd/user/
podman generate systemd --name redhat-operator-index-4.10 >> container-redhat-operator-index.service
systemctl --user daemon-reload
systemctl --user enable container-redhat-operator-index.service
systemctl --user restart container-redhat-operator-index.service
{% endhighlight %}

By creating the redhat-operator-index container we can query the available operator versions to download on the channel: stable-4.10.

Step 3. Usage of the redhat-operator-index container api

- List a specific operator by filtering on the name:

{% highlight bash %}
grpcurl -plaintext -d '{"name":"local-storage-operator"}' INBACRNRDL0100.offline.oxtechnix.lan:50051 api.Registry/GetPackage
{
  "name": "local-storage-operator",
  "channels": [
    {
      "name": "4.10",
      "csvName": "local-storage-operator.4.10.0-202208150436"
    },
    {
      "name": "stable",
      "csvName": "local-storage-operator.4.10.0-202208150436"
    }
  ],
  "defaultChannelName": "stable"
}
{% endhighlight %}

- The full list of operators supported by the redhat-operator-index:
<details>
<summary>{% highlight bash %}grpcurl -plaintext INBACRNRDL0100.offline.oxtechnix.lan:50051 api.Registry/ListPackages{% endhighlight %}</summary>
<br>
{% highlight bash %}
{
  "name": "3scale-operator"
}
{
  "name": "advanced-cluster-management"
}
{
  "name": "amq-broker-rhel8"
}
{
  "name": "amq-online"
}
{
  "name": "amq-streams"
}
{
  "name": "amq7-interconnect-operator"
}
{
  "name": "ansible-automation-platform-operator"
}
{
  "name": "ansible-cloud-addons-operator"
}
{
  "name": "apicast-operator"
}
{
  "name": "aws-efs-csi-driver-operator"
}
{
  "name": "aws-load-balancer-operator"
}
{
  "name": "bamoe-businessautomation-operator"
}
{
  "name": "bamoe-kogito-operator"
}
{
  "name": "bare-metal-event-relay"
}
{
  "name": "businessautomation-operator"
}
{
  "name": "cincinnati-operator"
}
{
  "name": "cluster-kube-descheduler-operator"
}
{
  "name": "cluster-logging"
}
{
  "name": "clusterresourceoverride"
}
{
  "name": "codeready-workspaces"
}
{
  "name": "codeready-workspaces2"
}
{
  "name": "compliance-operator"
}
{
  "name": "container-security-operator"
}
{
  "name": "costmanagement-metrics-operator"
}
{
  "name": "cryostat-operator"
}
{
  "name": "datagrid"
}
{
  "name": "devspaces"
}
{
  "name": "devworkspace-operator"
}
{
  "name": "dpu-network-operator"
}
{
  "name": "eap"
}
{
  "name": "elasticsearch-operator"
}
{
  "name": "external-dns-operator"
}
{
  "name": "file-integrity-operator"
}
{
  "name": "fuse-apicurito"
}
{
  "name": "fuse-console"
}
{
  "name": "fuse-online"
}
{
  "name": "gatekeeper-operator-product"
}
{
  "name": "idp-mgmt-operator-product"
}
{
  "name": "integration-operator"
}
{
  "name": "jaeger-product"
}
{
  "name": "jws-operator"
}
{
  "name": "kiali-ossm"
}
{
  "name": "klusterlet-product"
}
{
  "name": "kubernetes-nmstate-operator"
}
{
  "name": "kubevirt-hyperconverged"
}
{
  "name": "local-storage-operator"
}
{
  "name": "loki-operator"
}
{
  "name": "mcg-operator"
}
{
  "name": "metallb-operator"
}
{
  "name": "mtc-operator"
}
{
  "name": "mtv-operator"
}
{
  "name": "multicluster-engine"
}
{
  "name": "nfd"
}
{
  "name": "node-healthcheck-operator"
}
{
  "name": "node-maintenance-operator"
}
{
  "name": "numaresources-operator"
}
{
  "name": "ocs-operator"
}
{
  "name": "odf-csi-addons-operator"
}
{
  "name": "odf-lvm-operator"
}
{
  "name": "odf-multicluster-orchestrator"
}
{
  "name": "odf-operator"
}
{
  "name": "odr-cluster-operator"
}
{
  "name": "odr-hub-operator"
}
{
  "name": "openshift-cert-manager-operator"
}
{
  "name": "openshift-custom-metrics-autoscaler-operator"
}
{
  "name": "openshift-gitops-operator"
}
{
  "name": "openshift-pipelines-operator-rh"
}
{
  "name": "openshift-secondary-scheduler-operator"
}
{
  "name": "openshift-special-resource-operator"
}
{
  "name": "opentelemetry-product"
}
{
  "name": "performance-addon-operator"
}
{
  "name": "poison-pill-manager"
}
{
  "name": "ptp-operator"
}
{
  "name": "quay-bridge-operator"
}
{
  "name": "quay-operator"
}
{
  "name": "red-hat-camel-k"
}
{
  "name": "redhat-oadp-operator"
}
{
  "name": "rh-service-binding-operator"
}
{
  "name": "rhacs-operator"
}
{
  "name": "rhpam-kogito-operator"
}
{
  "name": "rhsso-operator"
}
{
  "name": "sandboxed-containers-operator"
}
{
  "name": "serverless-operator"
}
{
  "name": "service-registry-operator"
}
{
  "name": "servicemeshoperator"
}
{
  "name": "skupper-operator"
}
{
  "name": "sriov-network-operator"
}
{
  "name": "submariner"
}
{
  "name": "tang-operator"
}
{
  "name": "topology-aware-lifecycle-manager"
}
{
  "name": "vertical-pod-autoscaler"
}
{
  "name": "volsync-product"
}
{
  "name": "web-terminal"
}
{
  "name": "windows-machine-config-operator"
}
{% endhighlight %}
</details>

Step 4. Mirroring a specific list of container based images operator:

For the future comparission between the tools, we are going to consider the following list of operators:
	- local-storage-operator
	- odf-operator
	- mcg-operator
	- metallb-operator
	- kubernetes-nmstate-operator

- oc-cli mirroring process:

Make sure you are checking the following [What to configure for pull-secret file][offline-mirroring]

[offline-mirroring]: https://midu16.github.io/openshift4/2022/07/10/offline-mirroring.html

We are going to split the action of mirroring in two parts:
 - Connected Host, where the host can reach the internet 
 - Offline Host, where the host doesnt reach the internet BUT has a connection to an SFTP server.

- Connected Host actions:

{% highlight bash %}
export VERSION=stable-4.10
curl -s https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/${VERSION}/opm-linux.tar.gz  | tar zxvf - opm-linux
sudo cp opm-linux /usr/local/bin
opm version
	Version: version.Version{OpmVersion:"69bb8fe0a", GitCommit:"69bb8fe0ac3a93472b5aace0df7722c4eaf23b92",BuildDate:"2022-07-29T20:18:10Z", GoOs:"linux", GoArch:"amd64"}
{% endhighlight %}

Once opm-cli is made available to the host, you can proceed with creating the [Offline registry on the Connected Host][offline-registry]

[offline-registry]: https://midu16.github.io/openshift4/2022/07/09/offline-registry.html

Exporting the global variables:
{% highlight bash %}
export REGISTRY_NAME=INBACRNRDL0100.offline.oxtechnix.lan
export PULL_SECRET_FILE=$(pwd)/pull-secret.json
export REG_USER_PASSWD=$(cat ${PULL_SECRET_FILE} |jq .auths.\"${REGISTRY_NAME}:5000\".auth -r|base64 -d)
export REG_USER=$(echo ${REG_USER_PASSWD}|cut -d ":" -f 1)
export REG_PASSWORD=$(echo ${REG_USER_PASSWD}|cut -d ":" -f 2)
export RH_USER_PASSWD=$(cat ${PULL_SECRET_FILE}|jq .auths.\"registry.redhat.io\".auth -r|base64 -d)
export OLM_PKGS="local-storage-operator,odf-operator,mcg-operator,metallb-operator,kubernetes-nmstate-operator"
export OCP_VERSION=v4.10
export REGISTRY_NAMESPACE=olm-mirror
{% endhighlight %}

Start the container base image prune

{% highlight bash %}
opm index prune -f registry.redhat.io/redhat/redhat-operator-index:${OCP_VERSION} -p ${OLM_PKGS} -t ${REGISTRY_NAME}:5000/${REGISTRY_NAMESPACE}/redhat-operator-index:${OCP_VERSION}
{% endhighlight %}

Pushing the pruned container based images to the local registry:

{% highlight bash %}
podman push ${REGISTRY_NAME}:5000/${REGISTRY_NAMESPACE}/redhat-operator-index:${OCP_VERSION} 
{% endhighlight %}

Downloading the container base images from the local registry localy:

{% highlight bash %}
oc adm catalog mirror ${REGISTRY_NAME}:5000/${REGISTRY_NAMESPACE}/redhat-operator-index:${OCP_VERSION} file://local/index -a ${PULL_SECRET_FILE} --insecure

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!! DEPRECATION NOTICE:
!!   Sqlite-based catalogs are deprecated. Support for them will be removed in a
!!   future release. Please migrate your catalog workflows to the new file-based
!!   catalog format.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

src image has index label for database path: /database/index.db
using index path mapping: /database/index.db:/tmp/953794212
wrote database to /tmp/953794212
using database at: /tmp/953794212/index.db
...
Some part of the output has been removed in order to keep only the valueble information
...
info: Mirroring completed in 1h48m37.78s (1.733MB/s)
wrote mirroring manifests to manifests-redhat-operator-index-1661341299

To upload local images to a registry, run:

	oc adm catalog mirror file://local/index/olm-mirror/redhat-operator-index:v4.10 REGISTRY/REPOSITORY
{% endhighlight %}

Creating the archive of the container based images already downloaded localy:

{% highlight bash %}
tar czf ${REGISTRY_NAME}.tar.gz v2/
{% endhighlight %}

At this state you need to move the .tar.gz file to the Offline Host.

- Offline Host actions:

After transfering the container base images from the Connected Host to the Offline Host, can proceed with creating the [Offline registry on the Connected Host][offline-registry]

[offline-registry]: https://midu16.github.io/openshift4/2022/07/09/offline-registry.html

Exporting the global variables:
{% highlight bash %}
export REGISTRY_NAME=INBACRNRDL0100.offline.oxtechnix.lan
export PULL_SECRET_FILE=$(pwd)/pull-secret.json
export REG_USER_PASSWD=$(cat ${PULL_SECRET_FILE} |jq .auths.\"${REGISTRY_NAME}:5000\".auth -r|base64 -d)
export REG_USER=$(echo ${REG_USER_PASSWD}|cut -d ":" -f 1)
export REG_PASSWORD=$(echo ${REG_USER_PASSWD}|cut -d ":" -f 2)
export RH_USER_PASSWD=$(cat ${PULL_SECRET_FILE}|jq .auths.\"registry.redhat.io\".auth -r|base64 -d)
export OLM_PKGS="local-storage-operator,odf-operator,mcg-operator,metallb-operator,kubernetes-nmstate-operator"
export OCP_VERSION=v4.10
export REGISTRY_NAMESPACE=olm-mirror
{% endhighlight %}

Decompress the .tar.gz file that contains the mirrored container based images:
{% highlight bash %}
mkdir ${HOME}/registry-workingdirector; cd ${HOME}/registry-workingdirector
tar xvfz ${REGISTRY_NAMESPACE}.tar.gz -C ${HOME}/registry-workingdirector
{% endhighlight %}

Uploading the container based images to the Offline Host local registry:
{% highlight bash %}
oc adm catalog mirror file://local/index/${REGISTRY_NAMESPACE}/redhat-operator-index:${OCP_VERSION} ${REGISTRY_NAME}:5000/${REGISTRY_NAMESPACE} -a ${PULL_SECRET_FILE} --insecure
{% endhighlight %}

- oc-mirror-cli process:

Make sure you are checking the following [What to configure for pull-secret file][offline-mirroring]

[offline-mirroring]: https://midu16.github.io/openshift4/2022/07/10/offline-mirroring.html

Once the pull-secret file is properly configured, you will need to:
{% highlight bash %}
mkdir -p ${HOME}/.docker/
cp pull-secret.json ${HOME}/.docker/config.json
{% endhighlight %}

We are going to split the action of mirroring in two parts:
 - Connected Host, where the host can reach the internet 
 - Offline Host, where the host doesnt reach the internet BUT has a connection to an SFTP server.

- Connected Host actions:

Determine the container based images version:

{% highlight bash %}
grpcurl -plaintext -d '{"name":"odf-operator"}' $(hostname -f):50051 api.Registry/GetPackage
	{
	"name": "odf-operator",
	"channels": [
		{
		"name": "stable-4.10",
		"csvName": "odf-operator.v4.10.5"
		},
		{
		"name": "stable-4.9",
		"csvName": "odf-operator.v4.9.10"
		}
	],
	"defaultChannelName": "stable-4.10"
	}
grpcurl -plaintext -d '{"name":"local-storage-operator"}' $(hostname -f):50051 api.Registry/GetPackage
	{
	"name": "local-storage-operator",
	"channels": [
		{
		"name": "4.10",
		"csvName": "local-storage-operator.4.10.0-202208150436"
		},
		{
		"name": "stable",
		"csvName": "local-storage-operator.4.10.0-202208150436"
		}
	],
	"defaultChannelName": "stable"
	}
grpcurl -plaintext -d '{"name":"mcg-operator"}' $(hostname -f):50051 api.Registry/GetPackage
	{
	"name": "mcg-operator",
	"channels": [
		{
		"name": "stable-4.10",
		"csvName": "mcg-operator.v4.10.5"
		},
		{
		"name": "stable-4.9",
		"csvName": "mcg-operator.v4.9.10"
		}
	],
	"defaultChannelName": "stable-4.10"
	}
grpcurl -plaintext -d '{"name":"metallb-operator"}' $(hostname -f):50051 api.Registry/GetPackage
	{
	"name": "metallb-operator",
	"channels": [
		{
		"name": "4.10",
		"csvName": "metallb-operator.4.10.0-202208150436"
		},
		{
		"name": "stable",
		"csvName": "metallb-operator.4.10.0-202208150436"
		}
	],
	"defaultChannelName": "stable"
	}
grpcurl -plaintext -d '{"name":"kubernetes-nmstate-operator"}' $(hostname -f):50051 api.Registry/GetPackage
	{
	"name": "kubernetes-nmstate-operator",
	"channels": [
		{
		"name": "4.10",
		"csvName": "kubernetes-nmstate-operator.4.10.0-202208150436"
		},
		{
		"name": "stable",
		"csvName": "kubernetes-nmstate-operator.4.10.0-202208150436"
		}
	],
	"defaultChannelName": "stable"
	}
{% endhighlight %}

Creating the imageset-config.yaml file used by oc-mirror:

{% highlight yaml %}
---
apiVersion: mirror.openshift.io/v1alpha2
kind: ImageSetConfiguration
archieveSize: 2
mirror:
	operators:
		- registry.redhat.io/redhat/redhat-operator-index:v4.10
		  targetName: 'olm-mirror'
		  targetTag: v4.10
		  full: true
		  packages:
		  	- name: local-storage-operator
			  minVersion: '4.10.0-20220610417'
			  maxVersion: '4.10.0-20223160637'
			  channels:
			    - name: 'stable'
			- name: kubernetes-nmstate-operator
			  minVersion: '4.10.0-20220815043'
			  maxVersion: '4.10.0-20220815043'
			  channels:
			    - name: 'stable'
			- name: metallb-operator
			  minVersion: '4.10.0-202208150436'
			  maxVersion: '4.10.0-202208150436'
			  channels:
			    - name: 'stable'
			- name: mcg-operator
			  minVersion: 'v4.10.5'
			  maxVersion: 'v4.10.5'
			  channels:
			    - name: 'stable-4.10'
			- name: odf-operator
			  minVersion: 'v4.10.5'
			  maxVersion: 'v4.10.5'
			  channels:
			    - name: 'stable-4.10'
{% endhighlight %}

Downloading the container based images to the .tar file:

{% highlight bash %}
oc-mirror --config imageset-config.yaml file://archive
	Found: archive/oc-mirror-workspace/src/publish
	Found: archive/oc-mirror-workspace/src/v2
	Found: archive/oc-mirror-workspace/src/charts
	Found: archive/oc-mirror-workspace/src/release-signatures
	backend is not configured in imageset-config.yaml, using stateless mode
	backend is not configured in imageset-config.yaml, using stateless mode
	No metadata detected, creating new workspace
	WARN[0076] DEPRECATION NOTICE:
	Sqlite-based catalogs and their related subcommands are deprecated. Support for
	them will be removed in a future release. Please migrate your catalog workflows
	to the new file-based catalog format. 
	wrote mirroring manifests to archive/oc-mirror-workspace/operators.1661356546/manifests-redhat-operator-index

	To upload local images to a registry, run:

		oc adm catalog mirror file://redhat/redhat-operator-index:v4.10 REGISTRY/REPOSITORY

	...
	info: Mirroring completed in 26m26.56s (16.54MB/s)
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000000.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000001.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000002.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000003.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000004.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000005.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000006.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000007.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000008.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000009.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000010.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000011.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000012.tar
	Creating archive /apps/offline-registry/working-dor/archive/mirror_seq1_000013.tar
{% endhighlight %}

By setting the `archieveSize: 2`, this will create a number of .tar files which limits the size to 2GiB.

At this state you need to move the .tar.gz file to the Offline Host.

- Offline Host actions:

Make sure that the binary oc-mirror is also available on the Offline Host.

Exporting the global variables:
{% highlight bash %}
export REGISTRY_NAME=INBACRNRDL0100.offline.oxtechnix.lan
export REGISTRY_NAMESPACE=olm-mirror
{% endhighlight %}

Upload the container base images to the Offline Host registry:
{% highlight bash %}
oc-mirror --from ./archive docker://${REGISTRY_NAME}:5000/${REGISTRY_NAMESPACE}
{% endhighlight %}

Step 5. Mirroring tools comparison 

In the initial phase we are going to consider the mirroring size .tar file for each tool.

- oc-cli mirroring:

Once the mirror has finished, the size of the tar file for the operator list used in the example above:
{% highlight bash %}
du -h INBACRNRDL0100.offline.oxtechnix.lan.tar.gz 
	29G	INBACRNRDL0100.offline.oxtechnix.lan.tar.gz
{% endhighlight %}

- oc-mirror-cli mirroring:
{% highlight bash %}
ls -l 
total 26643192
-rw-rw-r--. 1 midu midu 2053686272 Aug 24 18:26 mirror_seq1_000000.tar
-rw-rw-r--. 1 midu midu 2126430208 Aug 24 18:26 mirror_seq1_000001.tar
-rw-rw-r--. 1 midu midu 2066301440 Aug 24 18:26 mirror_seq1_000002.tar
-rw-rw-r--. 1 midu midu 2107577856 Aug 24 18:26 mirror_seq1_000003.tar
-rw-rw-r--. 1 midu midu 2141018112 Aug 24 18:27 mirror_seq1_000004.tar
-rw-rw-r--. 1 midu midu 2123763712 Aug 24 18:27 mirror_seq1_000005.tar
-rw-rw-r--. 1 midu midu 2128370688 Aug 24 18:28 mirror_seq1_000006.tar
-rw-rw-r--. 1 midu midu 2050847232 Aug 24 18:28 mirror_seq1_000007.tar
-rw-rw-r--. 1 midu midu 1871073792 Aug 24 18:28 mirror_seq1_000008.tar
-rw-rw-r--. 1 midu midu 2075569664 Aug 24 18:28 mirror_seq1_000009.tar
-rw-rw-r--. 1 midu midu 2147634176 Aug 24 18:29 mirror_seq1_000010.tar
-rw-rw-r--. 1 midu midu 2085707776 Aug 24 18:31 mirror_seq1_000011.tar
-rw-rw-r--. 1 midu midu 2138003456 Aug 24 18:32 mirror_seq1_000012.tar
-rw-rw-r--. 1 midu midu  166561280 Aug 24 18:32 mirror_seq1_000013.tar
drwxrwxr-x. 2 midu midu       4096 Aug 24 18:32 oc-mirror-workspace
du -h 
4.0K	./oc-mirror-workspace
26G	.
{% endhighlight %}

In order to describe the content of the mirror_seq1_000000.tar 
{% highlight bash %}
oc-mirror describe mirror_seq1_000000.tar
{% endhighlight %}

As a conclusion, we can observe a 3GB difference between the size of the same container base images mirrored locally with the `oc-mirror`and `oc-cli`. This is a storage optimization of 10.35% in the benefit of the usage of `oc-mirror` cli.

Step 6. How to use the container based images to your OCPv.4.10 cluster

Once the container based images are mirrored to the BastionHost offline registry, there is still required to perform a couple of steps until the OCPv4.10 cluster is able to make use of them, therefore in this subchapter we will going to focus on what is required to do and how it differentiates from the `oc-mirror` and `oc` cli.

- oc-cli upload the container based images : 

Checking the content of the `BastionHost` Offline registry content after mirroring upload:

<details>
<summary>{% highlight bash %}curl -X GET -u <username>:<password> https://INBACRNRDL0100.offline.oxtechnix.lan:5000/v2/_catalog | jq . {% endhighlight %}</summary>
<br>
{% highlight bash %}
{
  "repositories": [
    "olm-mirror/local-index-olm-mirror-redhat-operator-index",
    "olm-mirror/odf4-mcg-core-rhel8",
    "olm-mirror/odf4-mcg-operator-bundle",
    "olm-mirror/odf4-mcg-rhel8-operator",
    "olm-mirror/odf4-odf-console-rhel8",
    "olm-mirror/odf4-odf-operator-bundle",
    "olm-mirror/odf4-odf-rhel8-operator",
    "olm-mirror/openshift4-frr-rhel8",
    "olm-mirror/openshift4-kubernetes-nmstate-operator-bundle",
    "olm-mirror/openshift4-kubernetes-nmstate-rhel8-operator",
    "olm-mirror/openshift4-metallb-operator-bundle",
    "olm-mirror/openshift4-metallb-rhel8",
    "olm-mirror/openshift4-metallb-rhel8-operator",
    "olm-mirror/openshift4-ose-kube-rbac-proxy",
    "olm-mirror/openshift4-ose-kubernetes-nmstate-handler-rhel8",
    "olm-mirror/openshift4-ose-local-storage-diskmaker",
    "olm-mirror/openshift4-ose-local-storage-operator",
    "olm-mirror/openshift4-ose-local-storage-operator-bundle",
    "olm-mirror/rhel8-postgresql-12",
  ]
}
{% endhighlight %}
</details>

Once the mirroring upload has finished, you can use the ICSP (ImageContentSourcePolicy) and CatalogSource files.

An successful mirror upload will terminate with the following message:
{% highlight bash %}
info: Mirroring completed in 18m55.19s (27.74MB/s)
no digest mapping available for file://local/index/olm-mirror/redhat-operator-index:v4.10, skip writing to ImageContentSourcePolicy
wrote mirroring manifests to manifests-index/olm-mirror/redhat-operator-index-1661786638
deleted dir /tmp/3222302677
{% endhighlight %}

The content of the `ImageContentSourcePolicy.yaml`:
{% highlight bash %}
---
apiVersion: operator.openshift.io/v1alpha1
kind: ImageContentSourcePolicy
metadata:
  labels:
    operators.openshift.org/catalog: "true"
  name: index-olm-mirror-redhat-operator-index-0
spec:
  repositoryDigestMirrors:
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/odf4-odf-rhel8-operator
    source: local/index/olm-mirror/redhat-operator-index/odf4/odf-rhel8-operator
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/odf4-mcg-core-rhel8
    source: local/index/olm-mirror/redhat-operator-index/odf4/mcg-core-rhel8
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-metallb-rhel8
    source: local/index/olm-mirror/redhat-operator-index/openshift4/metallb-rhel8
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-ose-kubernetes-nmstate-handler-rhel8
    source: local/index/olm-mirror/redhat-operator-index/openshift4/ose-kubernetes-nmstate-handler-rhel8
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/odf4-odf-console-rhel8
    source: local/index/olm-mirror/redhat-operator-index/odf4/odf-console-rhel8
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-metallb-rhel8-operator
    source: local/index/olm-mirror/redhat-operator-index/openshift4/metallb-rhel8-operator
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-ose-kube-rbac-proxy
    source: local/index/olm-mirror/redhat-operator-index/openshift4/ose-kube-rbac-proxy
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-ose-local-storage-operator-bundle
    source: local/index/olm-mirror/redhat-operator-index/openshift4/ose-local-storage-operator-bundle
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-kubernetes-nmstate-operator-bundle
    source: local/index/olm-mirror/redhat-operator-index/openshift4/kubernetes-nmstate-operator-bundle
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-ose-local-storage-diskmaker
    source: local/index/olm-mirror/redhat-operator-index/openshift4/ose-local-storage-diskmaker
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-frr-rhel8
    source: local/index/olm-mirror/redhat-operator-index/openshift4/frr-rhel8
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-metallb-operator-bundle
    source: local/index/olm-mirror/redhat-operator-index/openshift4/metallb-operator-bundle
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/odf4-mcg-operator-bundle
    source: local/index/olm-mirror/redhat-operator-index/odf4/mcg-operator-bundle
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-kubernetes-nmstate-rhel8-operator
    source: local/index/olm-mirror/redhat-operator-index/openshift4/kubernetes-nmstate-rhel8-operator
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4-ose-local-storage-operator
    source: local/index/olm-mirror/redhat-operator-index/openshift4/ose-local-storage-operator
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/odf4-mcg-rhel8-operator
    source: local/index/olm-mirror/redhat-operator-index/odf4/mcg-rhel8-operator
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/rhel8-postgresql-12
    source: local/index/olm-mirror/redhat-operator-index/rhel8/postgresql-12
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/odf4-odf-operator-bundle
    source: local/index/olm-mirror/redhat-operator-index/odf4/odf-operator-bundle
{% endhighlight %}

NOTE: One of the aspect that should be changed for the `ImageContentSourcePolicy.yaml` is the source path. The `local/index/olm-mirror/redhat-operator-index`should be replace with the `registry.redhat.io/redhat/redhat-operator-index`. 


The content of the `CatalogSource.yaml`:
{% highlight bash %}
apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: index/olm-mirror/redhat-operator-index
  namespace: openshift-marketplace
spec:
  image: INBACRNRDL0100.offline.oxtechnix.lan:5000/olm-mirror/local-index-olm-mirror-redhat-operator-index:v4.10
  sourceType: grpc
{% endhighlight %}

- oc-mirror-cli upload the container based images : 

Checking the content of the `BastionHost` Offline registry content after mirror upload:

<details>
<summary>{% highlight bash %}curl -X GET -u <username>:<password> https://INBACRNRDL0100.offline.oxtechnix.lan:5000/v2/_catalog | jq . {% endhighlight %}</summary>
<br>
{% highlight bash %}
{
  "repositories": [
    "olm-mirror/odf4/cephcsi-rhel8",
    "olm-mirror/odf4/mcg-core-rhel8",
    "olm-mirror/odf4/mcg-operator-bundle",
    "olm-mirror/odf4/mcg-rhel8-operator",
    "olm-mirror/odf4/ocs-must-gather-rhel8",
    "olm-mirror/odf4/ocs-operator-bundle",
    "olm-mirror/odf4/ocs-rhel8-operator",
    "olm-mirror/odf4/odf-console-rhel8",
    "olm-mirror/odf4/odf-csi-addons-operator-bundle",
    "olm-mirror/odf4/odf-csi-addons-rhel8-operator",
    "olm-mirror/odf4/odf-csi-addons-sidecar-rhel8",
    "olm-mirror/odf4/odf-operator-bundle",
    "olm-mirror/odf4/odf-rhel8-operator",
    "olm-mirror/odf4/rook-ceph-rhel8-operator",
    "olm-mirror/odf4/volume-replication-rhel8-operator",
    "olm-mirror/openshift4/frr-rhel8",
    "olm-mirror/openshift4/kubernetes-nmstate-operator-bundle",
    "olm-mirror/openshift4/kubernetes-nmstate-rhel8-operator",
    "olm-mirror/openshift4/metallb-operator-bundle",
    "olm-mirror/openshift4/metallb-rhel8",
    "olm-mirror/openshift4/metallb-rhel8-operator",
    "olm-mirror/openshift4/ose-csi-external-attacher",
    "olm-mirror/openshift4/ose-csi-external-provisioner",
    "olm-mirror/openshift4/ose-csi-external-resizer",
    "olm-mirror/openshift4/ose-csi-external-snapshotter",
    "olm-mirror/openshift4/ose-csi-node-driver-registrar",
    "olm-mirror/openshift4/ose-kube-rbac-proxy",
    "olm-mirror/openshift4/ose-kubernetes-nmstate-handler-rhel8",
    "olm-mirror/openshift4/ose-local-storage-diskmaker",
    "olm-mirror/openshift4/ose-local-storage-operator",
    "olm-mirror/openshift4/ose-local-storage-operator-bundle",
    "olm-mirror/redhat/rh-index",
    "olm-mirror/redhat-operator-index",
    "olm-mirror/rhceph/rhceph-5-rhel8",
    "olm-mirror/rhel8/postgresql-12",
  ]
}
{% endhighlight %}
</details>

Once the mirroring upload has finished, you can use the ICSP (ImageContentSourcePolicy) and CatalogSource files.

An successful mirror upload will terminate with the following message:
{% highlight bash %}
info: Planning completed in 10ms
sha256:33d5a81a5f78a4a63c1fd4c7bad0b0ec82beef5b847025ae1d097248a59705d2 inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/odf4/odf-csi-addons-operator-bundle:fbc9d4f0
info: Mirroring completed in 830ms (16.76kB/s)
Wrote release signatures to oc-mirror-workspace/results-1661760261
Rendering catalog image "inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/redhat/rh-index:v1-test" with file-based catalog 
Writing image mapping to oc-mirror-workspace/results-1661760261/mapping.txt
Writing CatalogSource manifests to oc-mirror-workspace/results-1661760261
Writing ICSP manifests to oc-mirror-workspace/results-1661760261
{% endhighlight %}

NOTE: Please, note that the DNS server should resolve `inbacrnrdl0100.offline.oxtechnix.lan` and `INBACRNRDL0100.offline.oxtechnix.lan`.

The content of the `ImageContentSourcePolicy.yaml`:
{% highlight bash %}
---
apiVersion: operator.openshift.io/v1alpha1
kind: ImageContentSourcePolicy
metadata:
  labels:
    operators.openshift.org/catalog: "true"
  name: operator-0
spec:
  repositoryDigestMirrors:
  - mirrors:
    - inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/odf4
    source: registry.redhat.io/odf4
  - mirrors:
    - inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/openshift4
    source: registry.redhat.io/openshift4
  - mirrors:
    - inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/rhceph
    source: registry.redhat.io/rhceph
  - mirrors:
    - inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/rhel8
    source: registry.redhat.io/rhel8
  - mirrors:
    - inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/redhat
    source: registry.redhat.io/redhat
{% endhighlight %}

The content of the `CatalogSource.yaml`:
{% highlight bash %}
apiVersion: operators.coreos.com/v1alpha1
kind: CatalogSource
metadata:
  name: rh-index
  namespace: openshift-marketplace
spec:
  image: inbacrnrdl0100.offline.oxtechnix.lan:5000/olm-mirror/redhat/rh-index:v1-test
  sourceType: grpc
{% endhighlight %}

Differences between `oc-cli`and `oc-mirror-cli` of the container base images upload:

	For the `oc-cli` container based images all images are uploaded to the `olm-mirror` namespace of the offline registry.

	For the `oc-mirror-cli` container based images are uploaded to the `olm-mirror`namespace and inside this namespace has been defined other sub-namespaces `odf4`, `openshift4`, `redhat` and `rhel8`.

	The `ICSP.yaml` file generated using the `oc-mirror-cli` its generating a more dynamic content for which no update is required. 


Step 7. How to backtrack the content of .tar file container base images content

In the following subchapter we will try to compare the how to backtrack the image content of the .tar files using the two different cli's.

- oc-mirror-cli:

<details>
<summary>{% highlight bash %}oc-mirror describe mirror_seq1_000000.tar{% endhighlight %}</summary>
<br>
{% highlight bash %}
{
 "kind": "Metadata",
 "apiVersion": "mirror.openshift.io/v1alpha2",
 "uid": "d84573c0-68d6-43a7-8c39-6e3dfd92aebe",
 "singleUse": true,
 "pastMirror": {
  "timestamp": 1661757629,
  "sequence": 1,
  "mirror": {
   "platform": {},
   "operators": [
    {
     "packages": [
      {
       "name": "local-storage-operator",
       "channels": [
        {
         "name": "stable"
        }
       ],
       "minVersion": "4.10.0-202206010417",
       "maxVersion": "4.10.0-202203160637"
      },
      {
       "name": "kubernetes-nmstate-operator",
       "channels": [
        {
         "name": "stable"
        }
       ],
       "minVersion": "4.10.0-202208150436",
       "maxVersion": "4.10.0-202208150436"
      },
      {
       "name": "metallb-operator",
       "channels": [
        {
         "name": "stable"
        }
       ],
       "minVersion": "4.10.0-202208150436",
       "maxVersion": "4.10.0-202208150436"
      },
      {
       "name": "mcg-operator",
       "channels": [
        {
         "name": "stable-4.10"
        }
       ],
       "minVersion": "v4.10.5",
       "maxVersion": "v4.10.5"
      },
      {
       "name": "odf-operator",
       "channels": [
        {
         "name": "stable-4.10"
        }
       ],
       "minVersion": "v4.10.5",
       "maxVersion": "v4.10.5"
      }
     ],
     "catalog": "registry.redhat.io/redhat/redhat-operator-index:v4.10",
     "targetName": "rh-index",
     "targetTag": "v1-test",
     "full": true
    }
   ],
   "helm": {}
  },
  "operators": [
   {
    "catalog": "registry.redhat.io/redhat/rh-index:v1-test",
    "imagePin": "registry.redhat.io/redhat/redhat-operator-index@sha256:ff11174525e29fdf2f3f3fb266ee86ae5a844c7922f59937ba86f277df835461",
    "packages": null
   }
  ],
  "associations": [
   {
    "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:ef2c06eaaf145efaabc638045f92bec3a4e50c892b261eb35a706446a0ffe7f5",
    "path": "odf4/ocs-operator-bundle",
    "id": "sha256:ef2c06eaaf145efaabc638045f92bec3a4e50c892b261eb35a706446a0ffe7f5",
    "tagSymlink": "a5de349",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57eae29299a1b1cf951e49b46fca184d8366acbd283cf88f321c59f0c2017472",
     "sha256:7c0424048fe9b970fc99e4f96e92f6c80160dab11f0992bd8456400f9a4b2393"
    ]
   },
   {
    "name": "sha256:7c89981748d38fafa31c8a8d624381db9c14c07160de7bc13588a0b0e3673b33",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:7c89981748d38fafa31c8a8d624381db9c14c07160de7bc13588a0b0e3673b33",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3de00bb8554b2c35c89412d5336f1fa469afc7b0160045dd08758d92c8a6b064",
     "sha256:c530010fb61c513e7f06fa29484418fabf62924fc80cc8183ab671a3ce461a8e",
     "sha256:6c155a0c493b106911b1fa3b975be2fc7e07ef3e8619b7d5b0d169488fce15d3",
     "sha256:cf0025a8a0f8316b443fd9c78be81e4c9d5fc51e2a559ec1544587aa3875f7ae",
     "sha256:5ec9f635fe39c0a7b767de084526721f7d6faf34558b22cf84769a214583f7dc",
     "sha256:d667946774b493e1779d7cc0afe77710662feb47a30ee96916d784924e193634"
    ]
   },
   {
    "name": "sha256:1d988be397cae4aad67a43534a2875edbee24135ba549549156fb8aa883f22a6",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:1d988be397cae4aad67a43534a2875edbee24135ba549549156fb8aa883f22a6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:2cbc2866f0e2741aa3c72c6a699db0f8b25a5a5fea7d49ee2aa4f9a97ec6ee4c",
     "sha256:17e3a5f768e10e019b5bf765f63f8f9243bdfc7856b6c5b92b2b93430a7a91e7",
     "sha256:94d83113c109588bc1fa214757a0039e7f30de42ed7198534778862ea0808ec6",
     "sha256:fb87d8b58779f27b458c4f0390c06913531b4e5f598e6775c2d9514612dfb912",
     "sha256:0153ef0ea24a20d0090be1e0f0aa68ac406f03bacc42ebd981746c362261d73b",
     "sha256:6c79ff80bbaeeb1bfc7dcd86d5b969d3db865e6136989e2283ce3e35beb31c6b"
    ]
   },
   {
    "name": "sha256:54f6bca97f44b76c065bbaed5915a97693ce1ea1a3f3a1cf65c610ff81622f3c",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:54f6bca97f44b76c065bbaed5915a97693ce1ea1a3f3a1cf65c610ff81622f3c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:bdee7855ef43f1c1d40221634c315c1998e5ee6f976d77dec4834f669bee371d",
     "sha256:df8985aa78d66ad0ca1e65cdf78c0a770212de626074c34770d25b8dcfc5e4bf",
     "sha256:113d1f68e376ad7a3bf129e8f089da75d1fd7a2938edec3d1dc6811a5e00aa10",
     "sha256:692a101ec5121707373957b27689e8f0b4564e10e9aee9985eb8f1824c36e892",
     "sha256:3691e020fd546c95f3a65ebad8b64b2fa390c31703b42e042e968119736806ca",
     "sha256:974003bd281ec2048dfcebd5bbcb7477e6b69dbb3083bffd3a5c4dee0284130a"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:7eeb65458c924f183658b54548463450ddc828a4d7f3fd9746b263c88a6cbbba",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:7eeb65458c924f183658b54548463450ddc828a4d7f3fd9746b263c88a6cbbba",
    "tagSymlink": "439144e4",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:7c89981748d38fafa31c8a8d624381db9c14c07160de7bc13588a0b0e3673b33",
     "sha256:1d988be397cae4aad67a43534a2875edbee24135ba549549156fb8aa883f22a6",
     "sha256:54f6bca97f44b76c065bbaed5915a97693ce1ea1a3f3a1cf65c610ff81622f3c"
    ]
   },
   {
    "name": "sha256:3945dc8427c91efff2f32b99199da7f6dd202430e04a9868d52734d45701e61a",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:3945dc8427c91efff2f32b99199da7f6dd202430e04a9868d52734d45701e61a",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
     "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
     "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
     "sha256:c1422527836f5a0509c89cec9561682ce6d1d5590a756e94e0d57ecb6705338a",
     "sha256:a6af77c1b9f5262b90d37941671c2390408791a771e230cb9a16b873170975d0"
    ]
   },
   {
    "name": "sha256:348c35af68022a58948e2e55b761eed836a3e721857839ff9ad011fa767fa319",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:348c35af68022a58948e2e55b761eed836a3e721857839ff9ad011fa767fa319",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
     "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
     "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
     "sha256:88134a30f8f33bbc424e2a97b36a0ef3d4293556b78ac7f36a79ecb7a7488e10",
     "sha256:8a120ac25823a6c55fe6e63e0ddef8c9bb4ec57b1ceed743216d0e163c8b4eed"
    ]
   },
   {
    "name": "sha256:71013b5b69ef2e68e64a7db5022184a0d7c3393d060a2c6b4648fb91ff34ba0b",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:71013b5b69ef2e68e64a7db5022184a0d7c3393d060a2c6b4648fb91ff34ba0b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
     "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
     "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
     "sha256:1379955babc729cfcae73db8dbb9eb1b5107bcbc50ebc1730e7fff9007f1124b",
     "sha256:862dd7a55e887984f0cfc6f816f7f97fcab354a3586eb2bca7065d840968db2d"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:fbb33bb93afdb1d668fcdde4ba53b57adc8629fabd92ef900956c14796035bbf",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:fbb33bb93afdb1d668fcdde4ba53b57adc8629fabd92ef900956c14796035bbf",
    "tagSymlink": "d0438cd9",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:3945dc8427c91efff2f32b99199da7f6dd202430e04a9868d52734d45701e61a",
     "sha256:348c35af68022a58948e2e55b761eed836a3e721857839ff9ad011fa767fa319",
     "sha256:71013b5b69ef2e68e64a7db5022184a0d7c3393d060a2c6b4648fb91ff34ba0b"
    ]
   },
   {
    "name": "sha256:a3328798bcc141bac38343cdbe6b702c7f3039e2f83a772a7fef9796650c22ee",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:a3328798bcc141bac38343cdbe6b702c7f3039e2f83a772a7fef9796650c22ee",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:3d4679d6550ed04bed8f137eccb2f5198efb4491950ec50f15831eda1b6ad963",
     "sha256:27495196c3d272e3a144ed681575993e152d5933b5c859f4c91e6041fcc92c93",
     "sha256:73e291e0193fc0ed8a2629cc8d8636e71963b48fa6e37248eb116af7da963e16"
    ]
   },
   {
    "name": "sha256:fdde8db0b341f856aa8de9178aee5ce5fee33e5d73421070e3bc0a2a5a49124f",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:fdde8db0b341f856aa8de9178aee5ce5fee33e5d73421070e3bc0a2a5a49124f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:abad6baafc4cb0a77e481dea4a8bc47a7ed5b5c944d494c18bfbec3aeba4e8cc",
     "sha256:0f19843c9f65781b094ecf100ef2544cbe719ebb726e9a514033200220aab81b",
     "sha256:92574ded95c3e4369221eff3857b6e97e258d5772f6ba0df5b7c92322bd76c31"
    ]
   },
   {
    "name": "sha256:6942c1479998e617cb71b27f4f870ed4392a12068ffa897e28f9c4805ebf4546",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:6942c1479998e617cb71b27f4f870ed4392a12068ffa897e28f9c4805ebf4546",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:ac3143d6092da265fe38fcde94e5aa790146bc14fc0580c8093e76bac041cda5",
     "sha256:5f999ab542b7e4082ada35420000d36a78b982bb4f440717844cfe2304da97bc",
     "sha256:46e554421127d48cd18a14d00d9502cd357e9bcf0a35937a784f0646b6320768"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:9c99f8318724c94346db4c9079705537ae177d276108bbc2e8c080fd95b58440",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:9c99f8318724c94346db4c9079705537ae177d276108bbc2e8c080fd95b58440",
    "tagSymlink": "df7c0f8f",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:a3328798bcc141bac38343cdbe6b702c7f3039e2f83a772a7fef9796650c22ee",
     "sha256:fdde8db0b341f856aa8de9178aee5ce5fee33e5d73421070e3bc0a2a5a49124f",
     "sha256:6942c1479998e617cb71b27f4f870ed4392a12068ffa897e28f9c4805ebf4546"
    ]
   },
   {
    "name": "sha256:cd7555805a368f8cc58f813778f6afb4ef440cd57971c182a76292cc9d2dc7d4",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:cd7555805a368f8cc58f813778f6afb4ef440cd57971c182a76292cc9d2dc7d4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
     "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
     "sha256:9054b3c65ddde3513a950445cae9a66a1466d3f2542689a8fba891b23c760da2",
     "sha256:0308efb0948b3167eb5f4f73269b505a95366352812a853fb21aed32b611c6fb"
    ]
   },
   {
    "name": "sha256:3c2fd709e8b53703af8d43edbec7329a606c4f8b893a0ee9a3f698ecd5ec73e0",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:3c2fd709e8b53703af8d43edbec7329a606c4f8b893a0ee9a3f698ecd5ec73e0",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
     "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
     "sha256:aa7181879654543f7cd4e1ff5930bd4a5e3aabb09d437c356c5813a33bae8e46",
     "sha256:cb0329bcccd088113b5fae6bb7649b84d9443a0439ef071e7ac369d79f222606"
    ]
   },
   {
    "name": "sha256:29976510af6505f66d901760ab8fea4e7728eac6d29a057d2087f0a1b87fe1f4",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:29976510af6505f66d901760ab8fea4e7728eac6d29a057d2087f0a1b87fe1f4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
     "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
     "sha256:79652dc1eab77c217465dcec66fcedd370a09287459a71535d92c2f77b8b6117",
     "sha256:55cce6c465d4a15f610e0c5ce81c6a39a5bcf111e45c0a9177074be1b0ae4d17"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:db35b81f6655a08014e843d79fa09c8c40fe18f1eadc285cd7db5866546d87d0",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:db35b81f6655a08014e843d79fa09c8c40fe18f1eadc285cd7db5866546d87d0",
    "tagSymlink": "38ec220d",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:cd7555805a368f8cc58f813778f6afb4ef440cd57971c182a76292cc9d2dc7d4",
     "sha256:3c2fd709e8b53703af8d43edbec7329a606c4f8b893a0ee9a3f698ecd5ec73e0",
     "sha256:29976510af6505f66d901760ab8fea4e7728eac6d29a057d2087f0a1b87fe1f4"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-operator-bundle@sha256:b89625d39585def00c85fb7d267000cd205cfdec8d391382b7bc6c1bb8241b7a",
    "path": "odf4/odf-csi-addons-operator-bundle",
    "id": "sha256:b89625d39585def00c85fb7d267000cd205cfdec8d391382b7bc6c1bb8241b7a",
    "tagSymlink": "4ecf0d1a",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0815bc1b7ce639a8b4fe3b807355cca5ea4c19e90f3e599b6f238f8f2f11cc42",
     "sha256:1a7f1b1ca3099b791fabafc809a83737f0ca27f01e2020baa8e6af50f87d42b0"
    ]
   },
   {
    "name": "sha256:cc200547f588bba56d2a0c54f62dcb95ce08db1be4289f43bc66d56cbb8aa9c4",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:cc200547f588bba56d2a0c54f62dcb95ce08db1be4289f43bc66d56cbb8aa9c4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
     "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
     "sha256:8083d37c1cce754dd0a1edb6ba50b3cdbd217f057ed8cb817727c94828e6452d",
     "sha256:29d06dcbe45dfb19043b6eff67f1f1eea916401ef6d3b80187a9f68a354c7e42"
    ]
   },
   {
    "name": "sha256:56a7857ecba3bfc6170950f06d156b79feee36f961670d81457339d1cbe9fbaa",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:56a7857ecba3bfc6170950f06d156b79feee36f961670d81457339d1cbe9fbaa",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
     "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
     "sha256:992fb547dce19426af3f6453eb1a00a308de234b6121765e5fb371e63f01e541",
     "sha256:eb879e8fc7c45332f2d4e95171bc35e27845a7a49b3a9c76613942bd7e88ab7f"
    ]
   },
   {
    "name": "sha256:d6959fc60179ff800de7a4380f4f759237774636571c299169ecf5b42bd3f3f1",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:d6959fc60179ff800de7a4380f4f759237774636571c299169ecf5b42bd3f3f1",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
     "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
     "sha256:eec097a6cebd16fffbbf307acf30958ffc67e43008de878eabeb31c1edaa1d88",
     "sha256:19836acebdf7f335811b367658e79c743db538d86a6d12e566b533bf66070e4a"
    ]
   },
   {
    "name": "sha256:03e992572593988e09c37b48f94307b2b4c79f2ed961b0d2a6eba7bef9233bc5",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:03e992572593988e09c37b48f94307b2b4c79f2ed961b0d2a6eba7bef9233bc5",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
     "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
     "sha256:c7a47ce47a9958c3fa1633bea7f8dffd8fadd95798438b2f7a1fae256c8b5940",
     "sha256:69da13aaf80f3462ea9c8bbfbad0c6e9c7e70dc11d90363d8de1a103b21f285f"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:004362f4560a23975e9b453d18da6ddd99d4131589952b395b84df49cb125f8c",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:004362f4560a23975e9b453d18da6ddd99d4131589952b395b84df49cb125f8c",
    "tagSymlink": "54f96e30",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:cc200547f588bba56d2a0c54f62dcb95ce08db1be4289f43bc66d56cbb8aa9c4",
     "sha256:56a7857ecba3bfc6170950f06d156b79feee36f961670d81457339d1cbe9fbaa",
     "sha256:d6959fc60179ff800de7a4380f4f759237774636571c299169ecf5b42bd3f3f1",
     "sha256:03e992572593988e09c37b48f94307b2b4c79f2ed961b0d2a6eba7bef9233bc5"
    ]
   },
   {
    "name": "sha256:94c31108dbcd90042f119fdc8a4f6ed33f01e5d191cea093fa938d7efd199fbb",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:94c31108dbcd90042f119fdc8a4f6ed33f01e5d191cea093fa938d7efd199fbb",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:002c9820deb5c42560208ec3c0f2ff43b27346a7aca2786bc2763620a290391d",
     "sha256:6bdea5fff32dbb7dd7466503a6f288b035042996dce6f58c410530ab58e8cf50"
    ]
   },
   {
    "name": "sha256:4c5b0420eb7c918cee192e855b7f1109eb21b2b3de8c075e7978882c0fedeb14",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:4c5b0420eb7c918cee192e855b7f1109eb21b2b3de8c075e7978882c0fedeb14",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:fe15b86e6f05ef5a4f4e954163d7635699317ee382b33a14579fa4291440527d",
     "sha256:74f86d1a2ef479b624fd20cc45ba063a8d00e3899702864818b17977ada556ce"
    ]
   },
   {
    "name": "sha256:1c4240b765ef1785fff3cc4233ad1d9fcbb2da011b5bed64876720c553055bf8",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:1c4240b765ef1785fff3cc4233ad1d9fcbb2da011b5bed64876720c553055bf8",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:06ffebee5ba70f0d1a738e5e57b5b748b450d2a4bc0cc03af989e2ec9e195ecc",
     "sha256:00da6303ad18a72a18199b0c38376f5f423a4329325d9f5fe74f134e0a794150"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:179b50f0e2d2cd1ac9db869a67781610e8335424310983bb581487503c6b5498",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:179b50f0e2d2cd1ac9db869a67781610e8335424310983bb581487503c6b5498",
    "tagSymlink": "de3550ca",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:94c31108dbcd90042f119fdc8a4f6ed33f01e5d191cea093fa938d7efd199fbb",
     "sha256:4c5b0420eb7c918cee192e855b7f1109eb21b2b3de8c075e7978882c0fedeb14",
     "sha256:1c4240b765ef1785fff3cc4233ad1d9fcbb2da011b5bed64876720c553055bf8"
    ]
   },
   {
    "name": "sha256:fc500c69f5078d4f6ec65fed3354a44e479b39e9b1f552bcda2f1f90692f4072",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:fc500c69f5078d4f6ec65fed3354a44e479b39e9b1f552bcda2f1f90692f4072",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
     "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
     "sha256:d9b909f23116cc7ca79900b835333b01118902921ab7e6fb4123ff6239ad573b",
     "sha256:9d3be1e9e43ea4703acf641d90655479e186f8aac66afd659026af9e0794b25a"
    ]
   },
   {
    "name": "sha256:8c7450c98e8f82d3563ffde1e9466a86c8c4706ecd3f9ae63c0e78d028c4addc",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:8c7450c98e8f82d3563ffde1e9466a86c8c4706ecd3f9ae63c0e78d028c4addc",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
     "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
     "sha256:b4adbc86ee2ef0fe30b7f743c02d134707641b9013e59b3cee1ca6e6e353e70a",
     "sha256:a59bf1dc1ad88170f0edef6f295bd4cf6fedb4bec8580f1e46d2d98aacad6536"
    ]
   },
   {
    "name": "sha256:7ed62291f7d2dd79ea698e1b540f3fb9a74f207a7cdd2831faae75bc7f0561a9",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:7ed62291f7d2dd79ea698e1b540f3fb9a74f207a7cdd2831faae75bc7f0561a9",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
     "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
     "sha256:3f0ca8e5b5b7946ef7a0248fbf440ce431ee900e7976b29912c2572562ded3d2",
     "sha256:976ba1ced065d7d541591561170e709b55975f029cc727717d648c45d83b8a8a"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:f2a27a9a9d70b92f8141ad64426eeb245a2eda7319a65f8652b109df66d9c8fe",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:f2a27a9a9d70b92f8141ad64426eeb245a2eda7319a65f8652b109df66d9c8fe",
    "tagSymlink": "54b1e4ef",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:fc500c69f5078d4f6ec65fed3354a44e479b39e9b1f552bcda2f1f90692f4072",
     "sha256:8c7450c98e8f82d3563ffde1e9466a86c8c4706ecd3f9ae63c0e78d028c4addc",
     "sha256:7ed62291f7d2dd79ea698e1b540f3fb9a74f207a7cdd2831faae75bc7f0561a9"
    ]
   },
   {
    "name": "sha256:f8e8253ab40975fc3b8b7c94e51aa0128eff7ca3aabafd0668d87e2e9f7ac66d",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:f8e8253ab40975fc3b8b7c94e51aa0128eff7ca3aabafd0668d87e2e9f7ac66d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
     "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
     "sha256:7081d295ad8361d45d66588d84e6a9cf8eb4807d52c0340c5c4318b1cc7e5a06",
     "sha256:7ad0de68b31466f71ce7650e1b60ba7e3663b63277f09003883be3e89274df93"
    ]
   },
   {
    "name": "sha256:71b85d6c84c0a0c2f4d3249b802a51ce427ac6216fca24fabe9650028e24ccdc",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:71b85d6c84c0a0c2f4d3249b802a51ce427ac6216fca24fabe9650028e24ccdc",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
     "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
     "sha256:e459b78b4d6a22346c75b1d6e14958bae7e75432d0f46fdac553f77695ce7392",
     "sha256:8efc8858a917638a88d5896286e308871a2965c9e4dff2414733eb38f1b2921e"
    ]
   },
   {
    "name": "sha256:f6e545aa34174b5861a8c512aa40d411cc0e79cfe69d50aa6041d50540da96a4",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:f6e545aa34174b5861a8c512aa40d411cc0e79cfe69d50aa6041d50540da96a4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
     "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
     "sha256:5bef59fc23f7249e4024f8589174abf533ec95b54abdb9fdab33d6fcfe1f944f",
     "sha256:51608620df5baca0ea8875e02b63f8aa19bd0a635a51a49fc6a44d8cbfaa7a94"
    ]
   },
   {
    "name": "sha256:d763aa02b44ad13031bac316dd6bcc40b9a6202439131c200fa667ee7ca078ed",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:d763aa02b44ad13031bac316dd6bcc40b9a6202439131c200fa667ee7ca078ed",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
     "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
     "sha256:952b3f4a49f998fc4bba154b90d40f224480c9bd1950add9bc2ec77891a56779",
     "sha256:c4c8a311ff97d61087c8feef66050ee6d4c6b5133da1f21804405ed06c8b5c20"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-resizer@sha256:34386f8c0227015c1abd9d7dfd8e9b687cba7047ec021d393ab39133e67178b9",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:34386f8c0227015c1abd9d7dfd8e9b687cba7047ec021d393ab39133e67178b9",
    "tagSymlink": "fbc6ecae",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:f8e8253ab40975fc3b8b7c94e51aa0128eff7ca3aabafd0668d87e2e9f7ac66d",
     "sha256:71b85d6c84c0a0c2f4d3249b802a51ce427ac6216fca24fabe9650028e24ccdc",
     "sha256:f6e545aa34174b5861a8c512aa40d411cc0e79cfe69d50aa6041d50540da96a4",
     "sha256:d763aa02b44ad13031bac316dd6bcc40b9a6202439131c200fa667ee7ca078ed"
    ]
   },
   {
    "name": "sha256:219d6d492380d0a28b5bfaf7b38d91e72cbca61e870106e2cc4010565afadd4f",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:219d6d492380d0a28b5bfaf7b38d91e72cbca61e870106e2cc4010565afadd4f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:1e09a5ee0038fbe06a18e7f355188bbabc387467144abcd435f7544fef395aa1",
     "sha256:0d725b91398ed3db11249808d89e688e62e511bbd4a2e875ed8493ce1febdb2c",
     "sha256:4c41313c0b05a90f14def717149dc166937b92ec9e10c7995782af529d7850cc",
     "sha256:4a583e33f1036f0cfb0254cc6786e7b1241c3c559908c4b8964a7648a5b1ac3d"
    ]
   },
   {
    "name": "sha256:0953fadd1a08e8d6327423d9d738aa4a27045e22d35c12f8fed54f5094081e74",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:0953fadd1a08e8d6327423d9d738aa4a27045e22d35c12f8fed54f5094081e74",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8ae94d44715e38323c503f34985d4dae431ad8c200aaffd1806ec5c6b2f9c2f",
     "sha256:d2476c1919664b73a98495ff6e8d395a5c7cd0a461f1c80d6eb985d1c001303e",
     "sha256:a653e1147119d3d27931a8f85a214df5b973e3250b3cca0e60bfd249754108f8",
     "sha256:abdde89a6f15981d3529adc4e5abe53957de22ae583f144375c9cf3bb3ecad40"
    ]
   },
   {
    "name": "sha256:92f9b80b3d41eb475657f39f62ffb70508f667a60b8e77affbeaca349084d1b3",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:92f9b80b3d41eb475657f39f62ffb70508f667a60b8e77affbeaca349084d1b3",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e9459e3a98cc790007c3680dd8b292ea532d820ea8cbdf02344fe6c370d82a95",
     "sha256:f3992bbd282187c79c59ab9612f11590577b44953233c624e1700082117db955",
     "sha256:b659dc1ba9af4250c2308cd059a647820d954ae6e067186a6acd8f58d216522d",
     "sha256:9e91e8dabaafacfb11aac9efa05cdc246206938be2e59e6800ccae488bdc202c"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:cdd4838430fde2c9fcec7cd37429c2cc99c8f4bbdc27e4069f8abe4bff88498f",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:cdd4838430fde2c9fcec7cd37429c2cc99c8f4bbdc27e4069f8abe4bff88498f",
    "tagSymlink": "f845856f",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:219d6d492380d0a28b5bfaf7b38d91e72cbca61e870106e2cc4010565afadd4f",
     "sha256:0953fadd1a08e8d6327423d9d738aa4a27045e22d35c12f8fed54f5094081e74",
     "sha256:92f9b80b3d41eb475657f39f62ffb70508f667a60b8e77affbeaca349084d1b3"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:0651850ea45cad985998ede7e625e22ae3ffc50442142fbe49eef558cffc81a0",
    "path": "odf4/odf-operator-bundle",
    "id": "sha256:0651850ea45cad985998ede7e625e22ae3ffc50442142fbe49eef558cffc81a0",
    "tagSymlink": "46737fef",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:17d51871f0c4c1a06d7622c073147cf4cbec945b385e36d387be02e2a8dbaaff",
     "sha256:efadf00181bc668257220b3b433cfeae5d7e20084cd6b2c407d8b1847a178a7b"
    ]
   },
   {
    "name": "sha256:4e08a9f898861aa590dc111dfc83c8bcceeaaebce3287d42ad0ec308900f4706",
    "path": "openshift4/frr-rhel8",
    "id": "sha256:4e08a9f898861aa590dc111dfc83c8bcceeaaebce3287d42ad0ec308900f4706",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
     "sha256:a4f595f195c3b56b0e26800a2e8a533305ca66685e9e6e0c2f8658748a0200aa",
     "sha256:48e5b0263cffeabcc3e1ea333161efbc6c87bbdb3393d66ef6e61f8e46b1fdd3"
    ]
   },
   {
    "name": "sha256:40f5830498be3c855d22e3a420b0671ceda22415202050b0b766edf3f6acd2bf",
    "path": "openshift4/frr-rhel8",
    "id": "sha256:40f5830498be3c855d22e3a420b0671ceda22415202050b0b766edf3f6acd2bf",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
     "sha256:2e08df6a0c245c08ec9b632f6b2928aedfaf83b4e757089b464ceb03d99a7f8d",
     "sha256:7baf616439cffc2009ded159af4b5fb7643252c52c4e8ddde18c4fa8e37cc0f9"
    ]
   },
   {
    "name": "sha256:f9c86f088c8bbc418ef6466686b4e583328cfadc815fec6f5b0f535eb87c3dd2",
    "path": "openshift4/frr-rhel8",
    "id": "sha256:f9c86f088c8bbc418ef6466686b4e583328cfadc815fec6f5b0f535eb87c3dd2",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
     "sha256:13edb702211b6f93218a6d6ce87af88d5d097263dc121d353b7101619dce8823",
     "sha256:9e8876d6398b50792ad817c41fd69a6f3b628384448ba46d7a0f13030d352282"
    ]
   },
   {
    "name": "sha256:1ef1ed1a5da62c54c2f04638d85434d2622072ce98f034b859250000e0ccea3f",
    "path": "openshift4/frr-rhel8",
    "id": "sha256:1ef1ed1a5da62c54c2f04638d85434d2622072ce98f034b859250000e0ccea3f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
     "sha256:7c18f4c91232a705a27fb0b165530143763f6fd8d0b6a2f176ead3af24756163",
     "sha256:6510155546d525d87b87acabab5809d74f316123d282ebf4ce65a4020d1d306d"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/frr-rhel8@sha256:ab55c4fcca7d9f0d77f9a6cd039b680f84f44baa6c5fe18b1f11775ed45a39a0",
    "path": "openshift4/frr-rhel8",
    "id": "sha256:ab55c4fcca7d9f0d77f9a6cd039b680f84f44baa6c5fe18b1f11775ed45a39a0",
    "tagSymlink": "3013aa65",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:4e08a9f898861aa590dc111dfc83c8bcceeaaebce3287d42ad0ec308900f4706",
     "sha256:40f5830498be3c855d22e3a420b0671ceda22415202050b0b766edf3f6acd2bf",
     "sha256:f9c86f088c8bbc418ef6466686b4e583328cfadc815fec6f5b0f535eb87c3dd2",
     "sha256:1ef1ed1a5da62c54c2f04638d85434d2622072ce98f034b859250000e0ccea3f"
    ]
   },
   {
    "name": "sha256:c774f718d17ef31509cda6427b44243c21aa129d122531b69a92d11ad35c2fed",
    "path": "rhel8/postgresql-12",
    "id": "sha256:c774f718d17ef31509cda6427b44243c21aa129d122531b69a92d11ad35c2fed",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:633d8934e21d60dccb5c55df7a62f24f6ee0518f233c4b1948757a264269fb8a",
     "sha256:c94fcc6084503e3aba46fa487d92db02aa1a95337759430ebc9f8861ba3a3994",
     "sha256:f64d8e6c93dd4b01aee2fc70983785c9ee8d587baef2726d39c514b1d3b3c546"
    ]
   },
   {
    "name": "registry.redhat.io/rhel8/postgresql-12@sha256:44215c5b244b190c82d9d371a8ffd39b0c83576bd85c980cc72782a5cf9e6e1b",
    "path": "rhel8/postgresql-12",
    "id": "sha256:44215c5b244b190c82d9d371a8ffd39b0c83576bd85c980cc72782a5cf9e6e1b",
    "tagSymlink": "9309afa4",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:c769fd2780a6c502139ded77166644e73222b2ba00c3d0525aacb5f3d99bf1b4",
     "sha256:33d614388eace46a65a92f238dc0231ecb204873774fa93dc1c09e7022bace97",
     "sha256:2483c23ce5a3a0837576fc1500122b59ad53a593fc04eb677cd332205d855ed8",
     "sha256:c774f718d17ef31509cda6427b44243c21aa129d122531b69a92d11ad35c2fed"
    ]
   },
   {
    "name": "sha256:c769fd2780a6c502139ded77166644e73222b2ba00c3d0525aacb5f3d99bf1b4",
    "path": "rhel8/postgresql-12",
    "id": "sha256:c769fd2780a6c502139ded77166644e73222b2ba00c3d0525aacb5f3d99bf1b4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:399eb2b7226e96b12325f0470a572b98e868286c4e7568f7623d863ae36fbe02",
     "sha256:995c1a5d6ce458ce2654ca25a9a8454a70588bca8db7b41e06e931c00333fbda",
     "sha256:8c73fd021b2dc389e7bd1472d98b55a3cfab18687c2ec5583824899091c23db7"
    ]
   },
   {
    "name": "sha256:33d614388eace46a65a92f238dc0231ecb204873774fa93dc1c09e7022bace97",
    "path": "rhel8/postgresql-12",
    "id": "sha256:33d614388eace46a65a92f238dc0231ecb204873774fa93dc1c09e7022bace97",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0f6e46285dbeaad8b2b8f01b5fe21771fc2b522ceafaf88d8f51ff88b51d87a9",
     "sha256:b88304ccd20b48c3e167431fdaa53db68d449caf91511ca66a32b356f947b6ea",
     "sha256:c069673f6051eb73897763672a108329d74c778a64d0566b23cd04751ced5411",
     "sha256:a9c6da39523e0c6ffdc9b9e36ea2c5a4ba5c380d95bd0151f8d6c1bfaa7dd5b6",
     "sha256:6f7a6591d5f2ce5a6637ab27827603868f151d28ef1a1f8caee5555b914ef509"
    ]
   },
   {
    "name": "sha256:2483c23ce5a3a0837576fc1500122b59ad53a593fc04eb677cd332205d855ed8",
    "path": "rhel8/postgresql-12",
    "id": "sha256:2483c23ce5a3a0837576fc1500122b59ad53a593fc04eb677cd332205d855ed8",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:af5458290b9eb5772f0935e6dca7d35a4b75ec3a8117aa664029b0c4cce4f51e",
     "sha256:3c524d6519aa36ee81b7f55a59fc33ecc867ed4f2bc65d992ba64c716f5501fb",
     "sha256:7d106e8ce6698e752a6e44172a72e9a66c85a36c19f541494646eb6a9bc6819e"
    ]
   },
   {
    "name": "sha256:cc5e8530139e7b2e32285c0efd16a43a551365705a69664d223370e00b85e80b",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:cc5e8530139e7b2e32285c0efd16a43a551365705a69664d223370e00b85e80b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:a301327116a0e734fb34506202fafa3d0c94b4ec8f4e7e71a73d78c3a117419f",
     "sha256:81051d76ef8269de00d9e37d9aa57e88998c055c18d9a970233ffdb62785c960",
     "sha256:dae34b4e252ee42452b6bf54b0857049ca4115ef4dba7379e2cbd0815017fed8",
     "sha256:67d5efe70e06f58ab822b33cdfa89a8bd5bdc9f33d7fba86287752bc399520f6",
     "sha256:65220e141e4a6f97d3d8116b184ad63e6a055420fc3a45869451a0755f8fce16",
     "sha256:72f976b3c40f64f6e7fc49754b0ad0a4490e873d2427474729912f45e257ce1b"
    ]
   },
   {
    "name": "sha256:c052ffa071d5680d1f3e4c29eb97c2ecb9c8ee4c33fb32e05e9608a3b731fec8",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:c052ffa071d5680d1f3e4c29eb97c2ecb9c8ee4c33fb32e05e9608a3b731fec8",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55421525c6c3b6b3c9922e13a8c7ee45bb646e18f15dcda443d01da7942ad929",
     "sha256:d714b75d2c331c1143b2c269b173c6cacc0a7e04b57548f29a990c327fcaa532",
     "sha256:bcba8557624eec456700c8e900861d8b0833b3b1c8869514be650f34640c73e9",
     "sha256:5e371c6de53e806ba64300902b8a308b74fce12b9ce3555bbbfee10a96ab4494",
     "sha256:27b03e42f4d9c53d2d8b87cb74a9ab303f3e46d623e91ec31407b0d241997f75",
     "sha256:60319348cd8a351b06033fea5f474559866abe4ba320f7379f15c49c3921f157"
    ]
   },
   {
    "name": "sha256:b61836112c7b56c465766d1ec3040383d873526c46a4c52722ae79b72604b985",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:b61836112c7b56c465766d1ec3040383d873526c46a4c52722ae79b72604b985",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6c63947448a0c6869f49acbbcd25a3e195f4b75b06124eeaf2583b03d4e68654",
     "sha256:74abdf4838109d801733a5b37bdea79b137e86509734df5152188684e79c8a6c",
     "sha256:8786189a4cb3ed9311aa3dbefb927bf05713fe04901d96e136b8b1560dd401cd",
     "sha256:a4425ab5446185efd3facd25ad5c7fc39d20f43fb9103c6a90055bd87a070cb8",
     "sha256:a1a0ac617d89a90f2731d0295f7ef37af2cf48f86db2a46de414f89a124c9f10",
     "sha256:d545f1bd674487339afeb825ce03af0af755a589698823e7e03fdfa2d46ae2a0"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:e61cb3f5c56771f94b6c80a99c644be560b1b5569d9fac7b5cc2860edb00e0b8",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:e61cb3f5c56771f94b6c80a99c644be560b1b5569d9fac7b5cc2860edb00e0b8",
    "tagSymlink": "b19a8494",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:cc5e8530139e7b2e32285c0efd16a43a551365705a69664d223370e00b85e80b",
     "sha256:c052ffa071d5680d1f3e4c29eb97c2ecb9c8ee4c33fb32e05e9608a3b731fec8",
     "sha256:b61836112c7b56c465766d1ec3040383d873526c46a4c52722ae79b72604b985"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:a00e90621b5a6f94abd890c9ffa1dd9703f213b6a418b49570f692fb85affafb",
    "path": "odf4/odf-operator-bundle",
    "id": "sha256:a00e90621b5a6f94abd890c9ffa1dd9703f213b6a418b49570f692fb85affafb",
    "tagSymlink": "901ac434",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f1d580b90074dec76aec452264ecd20454ed205391ce01cdf38185726517fdc4",
     "sha256:ea46990d7f1233b30a43c6e1627929ea355962d24e2afc1c9407a331a85e401b"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:9dc3002750d465847390cc481f1ca8d9f9e1a7d7f1102583a1f9182565cc3695",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:9dc3002750d465847390cc481f1ca8d9f9e1a7d7f1102583a1f9182565cc3695",
    "tagSymlink": "9066065e",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:8cdc93f6f47459bcc8054ad5e84bec91cb9bd7d6edd3b47f0dd5e63b6a654659",
     "sha256:3dcf6eeb8d06b21b96c1f59813981eaf0813aeb22509029988d7d958fbf0c914",
     "sha256:d80de06fa4fba609711ed133e2b0eb7c93db177bf2c0b62b90204de98348054c"
    ]
   },
   {
    "name": "sha256:8cdc93f6f47459bcc8054ad5e84bec91cb9bd7d6edd3b47f0dd5e63b6a654659",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:8cdc93f6f47459bcc8054ad5e84bec91cb9bd7d6edd3b47f0dd5e63b6a654659",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:11a967fd7b2ffe59688fa6d7b19a9c359c55884de52ce578c0c6a776f3be2cf4",
     "sha256:d1ccdf0bdf3a316c00306b4f3c8dd220448cb1d13fbafd7810c4c780428bfd21"
    ]
   },
   {
    "name": "sha256:3dcf6eeb8d06b21b96c1f59813981eaf0813aeb22509029988d7d958fbf0c914",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:3dcf6eeb8d06b21b96c1f59813981eaf0813aeb22509029988d7d958fbf0c914",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:2a1a0cded0f72cc0f5b922e254e64859b8a263b72d5ae9af9a196aa3e73e59c0",
     "sha256:7e706e442779316087776ca98954334f0bbc4aac78dc6c1e5b50d95533186d67"
    ]
   },
   {
    "name": "sha256:d80de06fa4fba609711ed133e2b0eb7c93db177bf2c0b62b90204de98348054c",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:d80de06fa4fba609711ed133e2b0eb7c93db177bf2c0b62b90204de98348054c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:b7be3992d334655ab8b83676742281df4b8ae9df1359af4545ba630b1643082c",
     "sha256:f371c9f92a724a779fc361a367b1ea927a49a17fd8cdfcbdef5bb00f1e3d6574"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:ad9e7a8bae4e1d93ea1ceb9a8b57564e29639fbdc3bdd166a786e77eb120459a",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:ad9e7a8bae4e1d93ea1ceb9a8b57564e29639fbdc3bdd166a786e77eb120459a",
    "tagSymlink": "5f62ae23",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:2467f6af0910a0a13e3cc27b61047d096516cf8121a2ccb5bb53bd3b15161d67",
     "sha256:c83d71f10290b58c009b6bc69ea30c8f30a8783f56196bd7781429746fc33643",
     "sha256:409d952006035e35f91c49beaea03c0ef94633e7d215c23b1d912b0ca4ad7bfc"
    ]
   },
   {
    "name": "sha256:2467f6af0910a0a13e3cc27b61047d096516cf8121a2ccb5bb53bd3b15161d67",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:2467f6af0910a0a13e3cc27b61047d096516cf8121a2ccb5bb53bd3b15161d67",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d3b9a4a690bf1791b874c3495c6a8e2c039150b5882374cd9c42dd4bba68ba31",
     "sha256:a049ed70eeb87542c711449e14b6a7ccdde9ca2219d749fa0872aa755f2a89cb",
     "sha256:1943aa8fcf8db9481219eb792fcae32cdbf7444ce0748dcb8f8dfbbe90846fb1",
     "sha256:be068a32451285a2b1c714d0eac5a1e4e2f9ff32eba78ff4dcb3c40eeaba0970"
    ]
   },
   {
    "name": "sha256:c83d71f10290b58c009b6bc69ea30c8f30a8783f56196bd7781429746fc33643",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:c83d71f10290b58c009b6bc69ea30c8f30a8783f56196bd7781429746fc33643",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:02863a09124c1837ee0672a011fb7e2d5c95ae16af6b569f65d2e0f763127ddc",
     "sha256:97aead8e17dadf7e07e5153ee6d5a68d28e46847e01db6d9325742076043fd20",
     "sha256:e927bb5b2f36566f4751ba812a4481ce0a36bd9fc9cef2d0aebdf60ad44e6c81",
     "sha256:bdd943fe1d1f0ea3df31bf206c5f92b849ed7e8e2aedd887b20b82a9949da0d6"
    ]
   },
   {
    "name": "sha256:409d952006035e35f91c49beaea03c0ef94633e7d215c23b1d912b0ca4ad7bfc",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:409d952006035e35f91c49beaea03c0ef94633e7d215c23b1d912b0ca4ad7bfc",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:220d447748c8866cbfeac8fb3534dd8d49cc8b99cc625041414c17d0f80e02ca",
     "sha256:8909629d32e7d0fef085a5fcee0e0f318367006d81be0d5da8e0a209ee230793",
     "sha256:64250247c1ee7bac23e5e7b087c1ec11f4e2f95d40525d3b6aea9c5ae53523b1",
     "sha256:08ae180fcbf91704b9f4b7f85aaa633788e554e39eb6b420adda7fcaf3a052b8"
    ]
   },
   {
    "name": "sha256:e3537a12097946baba447c1e0e00306cca045cfe9e9ff4149334fde4e54d6985",
    "path": "rhel8/postgresql-12",
    "id": "sha256:e3537a12097946baba447c1e0e00306cca045cfe9e9ff4149334fde4e54d6985",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0a21bb5475ea5fbcfdeab2bbe08a1cf4ef0b55382d553d2c213620763078223c",
     "sha256:38dd71adcfc1f964c6f3ba6ae3b6daa95f612681cfb05298b225bb6347942f56",
     "sha256:408d72b5afe1db674fd2e4bd38c8ca7138ac3c5d1b523be9fe48fcc674660890",
     "sha256:f1500b692b89fb4c7b0ddc19991c1481547a6ab33969699a21c8dbf89431e0cd",
     "sha256:f1e76aa9f05861ad72f19d81acff1eb47950ade41f96c9e19d15d8235023268d"
    ]
   },
   {
    "name": "sha256:cf14141ebf2937ae498b153a74122daa48be124dcaffa01c5ec68517c0931ba3",
    "path": "rhel8/postgresql-12",
    "id": "sha256:cf14141ebf2937ae498b153a74122daa48be124dcaffa01c5ec68517c0931ba3",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b8b75f63afa4bfde71a4fa74e3a5f29334875de02294fd3d4d07c1ece7b8eb12",
     "sha256:a23a85b9dc9728803ce83b69bb1a7e3cef2a2be5bb35c0ec9fc16f72b17fb9ae",
     "sha256:c01393830c871ae35099e945c55c118f74292f9a86354d018ebe1e38cde42391",
     "sha256:e2de047de517517140e3668fa7da60caaabcb46049b4217859297e9749db2805",
     "sha256:3452245a427a21f58ae20456bee00935c5424127d1442f0815abbbd3094a63ec"
    ]
   },
   {
    "name": "sha256:a3a54335f1b08faa686ded823a35407a9f91e4481455f189639d233709f7c4cc",
    "path": "rhel8/postgresql-12",
    "id": "sha256:a3a54335f1b08faa686ded823a35407a9f91e4481455f189639d233709f7c4cc",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3abc8c0d3d4265b5efb17447cd4a399fc70858b08d7cd5dce88dca7a09bc089",
     "sha256:ada7e11fb107d011a3b016cc659ca3f138f11725949328d92d3714ac15ef4ce2",
     "sha256:d84558a70da2c2b3d51676a2caeeee48c18fd37f2ba3e39fa42baf8ddfcb4742",
     "sha256:e71bb50d04ca57e182930e803147105abf2708a2ddd3d8fbadb009a3d7aa88d3",
     "sha256:73bcb9672d417c9a6b4e7b42f1511a85637a1f3fa4061740bc577db25355f74d"
    ]
   },
   {
    "name": "sha256:dbd441c0b1ea839c2c485616336e79ce711f7214a2eccff43ad356758f875fec",
    "path": "rhel8/postgresql-12",
    "id": "sha256:dbd441c0b1ea839c2c485616336e79ce711f7214a2eccff43ad356758f875fec",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92559d5f5a908101d2776f8e756d73806b2bd3354be51e12d3111c90a4f09b07",
     "sha256:083e3eac55c875258c6477c979a400f62751e489a5aa9ffbbf0bf0bfdf773bcf",
     "sha256:71cf785318807dbca4c866feb2e756e67c6898947ac3ff0410374dac21595113",
     "sha256:389b8b9434e21f1bac99c79edbc1dce059a4c8f81b3df8c7bd6441ef39e87cec",
     "sha256:54e3a591fd221b0798085f078145e03c9c9b1a51154e827ceb71e05c8866ebd8"
    ]
   },
   {
    "name": "registry.redhat.io/rhel8/postgresql-12@sha256:96d2472910fd59acd4fc4371de03dd44071cab7d4f095f4e3bf30e646c9b0a82",
    "path": "rhel8/postgresql-12",
    "id": "sha256:96d2472910fd59acd4fc4371de03dd44071cab7d4f095f4e3bf30e646c9b0a82",
    "tagSymlink": "b3f074fc",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:e3537a12097946baba447c1e0e00306cca045cfe9e9ff4149334fde4e54d6985",
     "sha256:cf14141ebf2937ae498b153a74122daa48be124dcaffa01c5ec68517c0931ba3",
     "sha256:a3a54335f1b08faa686ded823a35407a9f91e4481455f189639d233709f7c4cc",
     "sha256:dbd441c0b1ea839c2c485616336e79ce711f7214a2eccff43ad356758f875fec"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:4bed96d7bbbe247a6bf0b83bb3d9d174bbef10c9508f7f43bd1f6802022f32cd",
    "path": "odf4/mcg-operator-bundle",
    "id": "sha256:4bed96d7bbbe247a6bf0b83bb3d9d174bbef10c9508f7f43bd1f6802022f32cd",
    "tagSymlink": "43085e16",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:a017c9138bc3608e16f8e098213aec3ecf891f7e02fed747dcf8815d4819fbd2",
     "sha256:9bb38a02c754b6c3e680ab9f0426499b6e02eed03a77d2641369c78778523fb0"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:dedbaa13ec89f3f8217ed23722ae0589fedc96f319d61cd2a79c9afc66dce340",
    "path": "odf4/ocs-operator-bundle",
    "id": "sha256:dedbaa13ec89f3f8217ed23722ae0589fedc96f319d61cd2a79c9afc66dce340",
    "tagSymlink": "4057a22f",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:a3ffd3cce0012873c5057f6d87c5ffccc643d4bdbe4a9069ae51b3876d86fc63",
     "sha256:c4ffed10f5f2e7f43f28ebe815b82519a5a8f7935d38488cfa47c1d5f8adc898"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:182d966cb488b188075d2ffd3f6451eec179429ac4bff55e2e26245049953a82",
    "path": "odf4/odf-operator-bundle",
    "id": "sha256:182d966cb488b188075d2ffd3f6451eec179429ac4bff55e2e26245049953a82",
    "tagSymlink": "fb32bc37",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:8ac332a1ae38ccacc975605d72dc9123d031be9b8d17b28c38ff44af5003225c",
     "sha256:411fadeec6a91bc321d1a78f2234c1c99a57d2ca6c83e3524e4a059678ddc9c4"
    ]
   },
   {
    "name": "sha256:0c2c37394fc7ffabe3a3b7d5af2d53145e1d448d3d457008122ae8e783b3b2fa",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:0c2c37394fc7ffabe3a3b7d5af2d53145e1d448d3d457008122ae8e783b3b2fa",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
     "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
     "sha256:2c5e66a566111754d906ba465fe869d3e5d5800599456ef336e4c6aee8545c97",
     "sha256:fe2e0ea53d979b83d1d5c7a492cb024aa9621f27d8904ed87bd34e0216dcb562"
    ]
   },
   {
    "name": "sha256:020b1e080bd3bc9131570105f07e129e0929b5e2ddb489d6b0ce83a032c8b0e2",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:020b1e080bd3bc9131570105f07e129e0929b5e2ddb489d6b0ce83a032c8b0e2",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
     "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
     "sha256:2fd81bf5bf180645859eef00c7f641e4b53839a037532c0efc8fc562ccbdb963",
     "sha256:5964a0ec9b903ff9a61a2fc9a845b8d4389d78d6bddef7d3936b671fce82f821"
    ]
   },
   {
    "name": "sha256:bee4933e98f4a94bb79c6693c95fa9f48f5f092c3b4616007a8bcc4aaa5711df",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:bee4933e98f4a94bb79c6693c95fa9f48f5f092c3b4616007a8bcc4aaa5711df",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
     "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
     "sha256:d5065fb26ae88a8a2c6a8a01f6848880a3cddb599d44a8fa2b53a65b074fa465",
     "sha256:c6c0671b9c97bfe47a2d1582ad6723b04f68a5883a12d2e5d8004ff81aa90643"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:7473ccb3651cda84119af3f73bc05d9634f7999461d7fca1ded03f067a942238",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:7473ccb3651cda84119af3f73bc05d9634f7999461d7fca1ded03f067a942238",
    "tagSymlink": "31b83f0c",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:0c2c37394fc7ffabe3a3b7d5af2d53145e1d448d3d457008122ae8e783b3b2fa",
     "sha256:020b1e080bd3bc9131570105f07e129e0929b5e2ddb489d6b0ce83a032c8b0e2",
     "sha256:bee4933e98f4a94bb79c6693c95fa9f48f5f092c3b4616007a8bcc4aaa5711df"
    ]
   },
   {
    "name": "sha256:06043f3ce603c130d77bc8f2508476b204d8bc9e03e04808b00d913d2e44190c",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:06043f3ce603c130d77bc8f2508476b204d8bc9e03e04808b00d913d2e44190c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
     "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
     "sha256:c3b42ad57cafd1f02309543c61e943efae75fde4fed6ed4ee4403d9da9e11fd8",
     "sha256:e416ad9838be4b15569c1fcef58dce51d64f2db06df6825362acf7c779322e88"
    ]
   },
   {
    "name": "sha256:d4fe2e93e294700a4bc5097f77a87754b41d49cbb04517e978ee2fdd03b6b242",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:d4fe2e93e294700a4bc5097f77a87754b41d49cbb04517e978ee2fdd03b6b242",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
     "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
     "sha256:f59ad339a71befd3e1884815a8ef7c39aed1ecb54ca8b8df08ecb858d0dd4997",
     "sha256:2c713cb1823844f2efc4cf3b6b224e99f46123724d2d5b5b9d8bf2269303b4f6"
    ]
   },
   {
    "name": "sha256:b53c7e37889e9539c222e66487b73bbe0673728259e9aab69e9cda9d59929db3",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:b53c7e37889e9539c222e66487b73bbe0673728259e9aab69e9cda9d59929db3",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
     "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
     "sha256:760ca557679402ff919a59d7e5063049dbb10f6f0ce682e944bcebdc1dfdf42f",
     "sha256:9a74754947ac2f24a520246cb13af4a396168f6671e5fc73b8f570cb54a6396e"
    ]
   },
   {
    "name": "sha256:b3105c212688c11c3c229a2c80404c50a08acd800ac46b59a88ae26dd5e55fdd",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:b3105c212688c11c3c229a2c80404c50a08acd800ac46b59a88ae26dd5e55fdd",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
     "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
     "sha256:b3567a89e612858a164eb24cc3795c4d1a4ea3f94764e005aabc02a26095fbcf",
     "sha256:c9ae8147d914f1616851e4eea5f7554130de6a7194be6ef96d6f8fc13398633f"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-resizer@sha256:1140505cccb1f88e2caccb4d6ae4d1b878381d531b0d9c029d1aaba3dbecd0ef",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:1140505cccb1f88e2caccb4d6ae4d1b878381d531b0d9c029d1aaba3dbecd0ef",
    "tagSymlink": "1b968cc",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:06043f3ce603c130d77bc8f2508476b204d8bc9e03e04808b00d913d2e44190c",
     "sha256:d4fe2e93e294700a4bc5097f77a87754b41d49cbb04517e978ee2fdd03b6b242",
     "sha256:b53c7e37889e9539c222e66487b73bbe0673728259e9aab69e9cda9d59929db3",
     "sha256:b3105c212688c11c3c229a2c80404c50a08acd800ac46b59a88ae26dd5e55fdd"
    ]
   },
   {
    "name": "sha256:2782ad869eb429ed09f6929de0d9cafa7a84c4d2987ef09b41b80267660b04e1",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:2782ad869eb429ed09f6929de0d9cafa7a84c4d2987ef09b41b80267660b04e1",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
     "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
     "sha256:e7d22c47e910d12cf6225056a0828560dc12c0d87c35c98b4cab327687e24cb6",
     "sha256:161662e2189a05d8972c853eb2f5f91c62746649119b3253cff65332cede4044"
    ]
   },
   {
    "name": "sha256:44d1260eaf1a934f137b43088079a31fe26a01c1091df6b2431a86939110c999",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:44d1260eaf1a934f137b43088079a31fe26a01c1091df6b2431a86939110c999",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
     "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
     "sha256:36836a28447a10b68aca0a91424144966e4de190a80268bf943718af1dd21738",
     "sha256:7a0e35b6c0311f071b30adc4d34715511dcbb1f9b32899cb6ad10b580266e111"
    ]
   },
   {
    "name": "sha256:437194af53596aa84065e5542817c9ff22ef1cba1dc4b6b0844f969ee78a4a76",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:437194af53596aa84065e5542817c9ff22ef1cba1dc4b6b0844f969ee78a4a76",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
     "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
     "sha256:6e586af64f277e618d68553b11fa25a935136265e3b65c3ec40b5dba90b5d53e",
     "sha256:8c7d8069337c40d9fb19166bbdf365ece17d05ba981a9833ebc157f3a0ec123d"
    ]
   },
   {
    "name": "sha256:bbb30770829051fcb6402dfa2d95623b2d705975e30c87f0985edb0f8e5b32e1",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:bbb30770829051fcb6402dfa2d95623b2d705975e30c87f0985edb0f8e5b32e1",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
     "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
     "sha256:75127a621485d83ed3912fe5edd28a37763cd185b62d2f408c47a34aac478b97",
     "sha256:2de6901de02c8a258c4f0cafc1988fbf2ce1aafea77c4c8a2a0365aec1c4017a"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-node-driver-registrar@sha256:376f21cfa8308dc1b61a3e8401b7023d903eda768912699f39403de742ab88b1",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:376f21cfa8308dc1b61a3e8401b7023d903eda768912699f39403de742ab88b1",
    "tagSymlink": "c3a8ecf1",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:2782ad869eb429ed09f6929de0d9cafa7a84c4d2987ef09b41b80267660b04e1",
     "sha256:44d1260eaf1a934f137b43088079a31fe26a01c1091df6b2431a86939110c999",
     "sha256:437194af53596aa84065e5542817c9ff22ef1cba1dc4b6b0844f969ee78a4a76",
     "sha256:bbb30770829051fcb6402dfa2d95623b2d705975e30c87f0985edb0f8e5b32e1"
    ]
   },
   {
    "name": "sha256:cd029fe2e0cd0124d1ff91cafcb7a60b6fe7815fb929191579216ada912568dd",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:cd029fe2e0cd0124d1ff91cafcb7a60b6fe7815fb929191579216ada912568dd",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
     "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
     "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
     "sha256:58cdca46f730e5d80b71a820bb70209ca30f44bae41f877de49cd57bd5d00c2c"
    ]
   },
   {
    "name": "sha256:b1bdcee0cc29a06800cd4a965937880f025641012f2697330b96c3ae49d17717",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:b1bdcee0cc29a06800cd4a965937880f025641012f2697330b96c3ae49d17717",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
     "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
     "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
     "sha256:43f887c2c912f1fd47f22dc4c6835e9b6873c7ef9963419c4d1d308d2d3f526f"
    ]
   },
   {
    "name": "sha256:15def301d4edc0e13f3f8aaee042f557d83acd1972de6bc1b164224b5909d23e",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:15def301d4edc0e13f3f8aaee042f557d83acd1972de6bc1b164224b5909d23e",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
     "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
     "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
     "sha256:bae4501729af247337465486cacc54ec3e696c38cc4177c7bfbaf22afb8bfe04"
    ]
   },
   {
    "name": "registry.redhat.io/rhceph/rhceph-5-rhel8@sha256:5c75d05c7c532072ec97bba9951cc225bcb16c3f0c9ba9c0a293cb7a00b53b5a",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:5c75d05c7c532072ec97bba9951cc225bcb16c3f0c9ba9c0a293cb7a00b53b5a",
    "tagSymlink": "ebbb906b",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:cd029fe2e0cd0124d1ff91cafcb7a60b6fe7815fb929191579216ada912568dd",
     "sha256:b1bdcee0cc29a06800cd4a965937880f025641012f2697330b96c3ae49d17717",
     "sha256:15def301d4edc0e13f3f8aaee042f557d83acd1972de6bc1b164224b5909d23e"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/metallb-operator-bundle@sha256:192103f9feb021cf2e6d21f9e7c390ee8bf43b6ea23835eb700f84e8d192f392",
    "path": "openshift4/metallb-operator-bundle",
    "id": "sha256:192103f9feb021cf2e6d21f9e7c390ee8bf43b6ea23835eb700f84e8d192f392",
    "tagSymlink": "33c225dd",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:7a45969f81c70bb6859db32edf9711c42514bf32e7203733b7e02a0f05c2df94",
     "sha256:e6d5906b8b06f4b8a2b2f8fd70a71c6df17faa69a8d92c51ebdafb56f48b6730"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:18da22ffcea86ef09c61d20ae81cd6f82cbf73c292dc4ef206dfd976ec7c5971",
    "path": "odf4/ocs-operator-bundle",
    "id": "sha256:18da22ffcea86ef09c61d20ae81cd6f82cbf73c292dc4ef206dfd976ec7c5971",
    "tagSymlink": "13bba01d",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:9ca210d03e3f17483b2576813bb4c16b673930f490f042ae66bdbd15d4be2972",
     "sha256:ccfed63053e23dc6f991a24cb6cf113ddceb21c48154e5fd98b216440ab6252b"
    ]
   },
   {
    "name": "sha256:d38d99215bf992169e549187ebc6d94c5a9d00dc37bf0ff00eca7e2b57a0cb10",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:d38d99215bf992169e549187ebc6d94c5a9d00dc37bf0ff00eca7e2b57a0cb10",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
     "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
     "sha256:39ae544373a117dece24092229e6e9ceac1f297678b342b820aaad20ac96ac81",
     "sha256:da09835fc1d9019a109339b8a6ee02919102e89ff299990a072e6ee20c7fa245"
    ]
   },
   {
    "name": "sha256:38b3d2ac7ab4e2fd4027a98a8e8f43d6bf3b7384e7968710e2c4087908cee097",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:38b3d2ac7ab4e2fd4027a98a8e8f43d6bf3b7384e7968710e2c4087908cee097",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
     "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
     "sha256:f6d20cda635a2a44e563c0107833b02275ec4a98673047845d73edb1804aa760",
     "sha256:0405c15437c5e6f6122d7e007a60f767a1ce5cddb7bbad4e4ea77e6317f2d2d7"
    ]
   },
   {
    "name": "sha256:1c88efb5bdac5f7b9a560b65d6ef9ced267541d393067011098782039d9293d0",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:1c88efb5bdac5f7b9a560b65d6ef9ced267541d393067011098782039d9293d0",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
     "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
     "sha256:a01a871b89993e1c4791d49cbad82beb3dd11b5e3ba87d9648b07907f031e0bd",
     "sha256:c5a46869e999dc6d5b935f166c5a24bcdb47c1368840823100529136b4bf8749"
    ]
   },
   {
    "name": "sha256:d3651d16b145c8cdf05e9715e18fef4d3c59c156ca8d644189e8652d5278aee4",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:d3651d16b145c8cdf05e9715e18fef4d3c59c156ca8d644189e8652d5278aee4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
     "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
     "sha256:e4566bf69a69a894277ec951e16f879a1331d4c70982c8d46cdc6beb735589b4",
     "sha256:cd5383e1c8bfe20f8e0b836fb1f3b61b95ea63315ee26261ba4774aa0c2a951e"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-snapshotter@sha256:997ff97cbdac7786bc5c8b9c2f0efa667ff0fc4bd02c0345225d79babcb2a912",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:997ff97cbdac7786bc5c8b9c2f0efa667ff0fc4bd02c0345225d79babcb2a912",
    "tagSymlink": "845fe4b6",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:d38d99215bf992169e549187ebc6d94c5a9d00dc37bf0ff00eca7e2b57a0cb10",
     "sha256:38b3d2ac7ab4e2fd4027a98a8e8f43d6bf3b7384e7968710e2c4087908cee097",
     "sha256:1c88efb5bdac5f7b9a560b65d6ef9ced267541d393067011098782039d9293d0",
     "sha256:d3651d16b145c8cdf05e9715e18fef4d3c59c156ca8d644189e8652d5278aee4"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:a640d9395a7dad7c5d2306af3ba60a3430358e705b647ebf272e38e27282ad4c",
    "path": "odf4/ocs-operator-bundle",
    "id": "sha256:a640d9395a7dad7c5d2306af3ba60a3430358e705b647ebf272e38e27282ad4c",
    "tagSymlink": "a69a5893",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:7732372f758045fbfc1d5c9bb2902e018bfa53c62797156e6022a1944d7ac9f8",
     "sha256:9edd7a574d1cd05c6f5b357104c668f75cdfbae5443e62e9de1fc6cf735988d6"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-resizer@sha256:75017593988025df444c8b3849b6ba867c3a7f6fc83212aeff2dfc3de4fabd21",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:75017593988025df444c8b3849b6ba867c3a7f6fc83212aeff2dfc3de4fabd21",
    "tagSymlink": "35a2fd67",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:357b2ae6eaca4596feaa1fcacba7b5083e954eea56d210f60abcb438f343d49d",
     "sha256:5ed2154c02436fbbe158b4cb821462aa4e1f5ea6e94566731a9c0f9954c23c4b",
     "sha256:4ca2a88d3065293ccb8827ae2f4d0e515d16fda75f86636e0d3a1a45e1353083",
     "sha256:0c8d8a66c04b95606cdaa8e1e306fb8877a1c0453aa7a33f578b32effa7fc150"
    ]
   },
   {
    "name": "sha256:357b2ae6eaca4596feaa1fcacba7b5083e954eea56d210f60abcb438f343d49d",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:357b2ae6eaca4596feaa1fcacba7b5083e954eea56d210f60abcb438f343d49d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
     "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
     "sha256:4cc89ef4c3da3e098416d0530cd0054e3d777b6f89c4dc4ec564859b6418d865",
     "sha256:ffee6b6e833e383ca04a3f97d8acb18e247ac745ae2f4c52675e05e09c1f6e16"
    ]
   },
   {
    "name": "sha256:5ed2154c02436fbbe158b4cb821462aa4e1f5ea6e94566731a9c0f9954c23c4b",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:5ed2154c02436fbbe158b4cb821462aa4e1f5ea6e94566731a9c0f9954c23c4b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
     "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
     "sha256:c186f885c19db339adc10e2fdbbfd05d8e515a581b6385f814159c9e4772deb6",
     "sha256:f8b5c613ea0daef779c153fb03eafd6c19645eff15c2ab779623caa4ca1c2ceb"
    ]
   },
   {
    "name": "sha256:4ca2a88d3065293ccb8827ae2f4d0e515d16fda75f86636e0d3a1a45e1353083",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:4ca2a88d3065293ccb8827ae2f4d0e515d16fda75f86636e0d3a1a45e1353083",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
     "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
     "sha256:d6ed18b71d246f2f31ad352782ba18f631a0f33f125d47cd06db187ec359bc99",
     "sha256:32134eca52f0181b3691a4610b0d76eda634e241f861322efb04bd1a8c29ac41"
    ]
   },
   {
    "name": "sha256:0c8d8a66c04b95606cdaa8e1e306fb8877a1c0453aa7a33f578b32effa7fc150",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:0c8d8a66c04b95606cdaa8e1e306fb8877a1c0453aa7a33f578b32effa7fc150",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
     "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
     "sha256:eac25aa7849e3bda5bf5dd99c6c5293dd54ee558aef81fc17fa0d44f14c282c2",
     "sha256:487c72010d13a3bbbeec2874c48809ef722ba298bfe133a3bbec65f8bd98a33d"
    ]
   },
   {
    "name": "sha256:ea0301b009f62b9126f07dddd2a71b9b84520a6d9c8d888104f8220203933065",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:ea0301b009f62b9126f07dddd2a71b9b84520a6d9c8d888104f8220203933065",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d3b9a4a690bf1791b874c3495c6a8e2c039150b5882374cd9c42dd4bba68ba31",
     "sha256:a049ed70eeb87542c711449e14b6a7ccdde9ca2219d749fa0872aa755f2a89cb",
     "sha256:756d7839fb0ad8eafac7f819c3f6d41a11407e0df3e24653275fe0c6ed5b04ad",
     "sha256:778bca37cfc4fac0153a14753d1857c42fe9affc9f9c93c98626425ffd39974e"
    ]
   },
   {
    "name": "sha256:ab47be2ad30f11041ccc122fa3352e931b35aa19876415011d9a3cc3069aeef4",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:ab47be2ad30f11041ccc122fa3352e931b35aa19876415011d9a3cc3069aeef4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:02863a09124c1837ee0672a011fb7e2d5c95ae16af6b569f65d2e0f763127ddc",
     "sha256:97aead8e17dadf7e07e5153ee6d5a68d28e46847e01db6d9325742076043fd20",
     "sha256:7445b6eacd6ae3c33281f3e2347bf507c0dd699155050814b8a45abd7dd319ed",
     "sha256:48dd514b99f4eb649d2467abef1cd8b7f24ea5dc4e46df5b75732c033a6e6c93"
    ]
   },
   {
    "name": "sha256:b36bcaf2817da2413abf65027de3b5bf3b6997c754d7348776dd04f353e1e837",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:b36bcaf2817da2413abf65027de3b5bf3b6997c754d7348776dd04f353e1e837",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:220d447748c8866cbfeac8fb3534dd8d49cc8b99cc625041414c17d0f80e02ca",
     "sha256:8909629d32e7d0fef085a5fcee0e0f318367006d81be0d5da8e0a209ee230793",
     "sha256:c8aed4fc98f7d3c47b1730eda20691e77bba5ae5510cbffd30ce7859836f86d8",
     "sha256:d4e9217cde6a0314a8296b37d62dbe1fae21196f940903153e29bf30262ee610"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:704398c98def956a4b4fd6cc09fb9367d706f8f7a05bdc66152c6d57325d7610",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:704398c98def956a4b4fd6cc09fb9367d706f8f7a05bdc66152c6d57325d7610",
    "tagSymlink": "5e73383d",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:ea0301b009f62b9126f07dddd2a71b9b84520a6d9c8d888104f8220203933065",
     "sha256:ab47be2ad30f11041ccc122fa3352e931b35aa19876415011d9a3cc3069aeef4",
     "sha256:b36bcaf2817da2413abf65027de3b5bf3b6997c754d7348776dd04f353e1e837"
    ]
   },
   {
    "name": "sha256:3a6619c418c74824b6a69dfce26f2070aae8b7d56b7cea756ab68d5e2c459e07",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:3a6619c418c74824b6a69dfce26f2070aae8b7d56b7cea756ab68d5e2c459e07",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3de00bb8554b2c35c89412d5336f1fa469afc7b0160045dd08758d92c8a6b064",
     "sha256:c530010fb61c513e7f06fa29484418fabf62924fc80cc8183ab671a3ce461a8e",
     "sha256:3d0fae63674bbf4ba99b8c5007fdba43df42df5fd138393a652d4b190350940b",
     "sha256:1273b18d811f5f88e065a9ed395156d0da7c616efd63a17304b09bb3e276814c"
    ]
   },
   {
    "name": "sha256:09a8a3da7024fbd081caff8cd62c67c898beade0597ff0656d0994daa08b4166",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:09a8a3da7024fbd081caff8cd62c67c898beade0597ff0656d0994daa08b4166",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:2cbc2866f0e2741aa3c72c6a699db0f8b25a5a5fea7d49ee2aa4f9a97ec6ee4c",
     "sha256:17e3a5f768e10e019b5bf765f63f8f9243bdfc7856b6c5b92b2b93430a7a91e7",
     "sha256:fdddffd289dea2c1f43bef5e034d9ac6ba587fa343ba808469b913b01598e5b6",
     "sha256:b75f4bf01bbe8ad5e797b4cbceccc401ea3e9eb4c1c0a6388fa3c01d5cfac386"
    ]
   },
   {
    "name": "sha256:d9332ec67415a78d38ee60b7d15c63475693590160caeb461767683b0dd21751",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:d9332ec67415a78d38ee60b7d15c63475693590160caeb461767683b0dd21751",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:bdee7855ef43f1c1d40221634c315c1998e5ee6f976d77dec4834f669bee371d",
     "sha256:df8985aa78d66ad0ca1e65cdf78c0a770212de626074c34770d25b8dcfc5e4bf",
     "sha256:39c96b7da7b0c1818df47df00d87d5171728b549d138f21307892de8f0001d33",
     "sha256:ebec2dcaa00a7b82e98583fd23b8b68da1804778e6b09f7356d61159dbc3804a"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:bb839a801a703a0b6850e7af8948a9546a8fc75822a88266a31c40874834cdb3",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:bb839a801a703a0b6850e7af8948a9546a8fc75822a88266a31c40874834cdb3",
    "tagSymlink": "73982f5e",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:3a6619c418c74824b6a69dfce26f2070aae8b7d56b7cea756ab68d5e2c459e07",
     "sha256:09a8a3da7024fbd081caff8cd62c67c898beade0597ff0656d0994daa08b4166",
     "sha256:d9332ec67415a78d38ee60b7d15c63475693590160caeb461767683b0dd21751"
    ]
   },
   {
    "name": "sha256:614cb31651348ed5b28c832d730f4e8b1877d02008ccaa89e2830acda79bc811",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:614cb31651348ed5b28c832d730f4e8b1877d02008ccaa89e2830acda79bc811",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:da6cf90000f1e8c68029513a3674919c4c460ed472ba88ccbaa046c74ddcc951",
     "sha256:92c3cd1997868b9ccce823c559765bc77f5bbc8ad061d6a81d382c568a21fb58",
     "sha256:e5bd8740d3a1a00a609f66dfbfabc797e1b28fc9bf762726bf0e5157804db430",
     "sha256:4e37b95877c4e3d4133766b91500219a2e921c20e3c784b5fb73958e3c15b3f1"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:ab6d793450e1ed2129e813525e888cc2dc0e4b96cfcac38cce1e99d36b94ffe8",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:ab6d793450e1ed2129e813525e888cc2dc0e4b96cfcac38cce1e99d36b94ffe8",
    "tagSymlink": "c1d122bd",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:cb9edb7b70d7c4b51fd76d60375bdf825ced57b24d2721638038c33ea8fdfd0c",
     "sha256:af8388cb68cf4c46dd2c6bb33f9e173a72959749366374bb173dd198b1143501",
     "sha256:614cb31651348ed5b28c832d730f4e8b1877d02008ccaa89e2830acda79bc811"
    ]
   },
   {
    "name": "sha256:cb9edb7b70d7c4b51fd76d60375bdf825ced57b24d2721638038c33ea8fdfd0c",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:cb9edb7b70d7c4b51fd76d60375bdf825ced57b24d2721638038c33ea8fdfd0c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:0c1fd83997e17b079085107d40f89cea2211f9ec3db88d5241019a85d06db5a7",
     "sha256:e76fbc91af5d560232191ef55c8366dcc52e0f8d4ddf97ba6140329787db6c39",
     "sha256:1d616dd988a30955cb276ab13571ee9f6f31dcf02c9c2ee78e9a618a7220dc23",
     "sha256:b690536f7d0f3e95e509e955b4ab865f7b6c2381fc7e71a54f32bab62b89a5a2"
    ]
   },
   {
    "name": "sha256:af8388cb68cf4c46dd2c6bb33f9e173a72959749366374bb173dd198b1143501",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:af8388cb68cf4c46dd2c6bb33f9e173a72959749366374bb173dd198b1143501",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:d2be686e74da7c701311c471acf80b269afb9a3165314de5aa2b9a6df6562fd7",
     "sha256:98a3f59d1db45f44899db07a0f1cbc3525c9e1cfa91805892ecabbe31ee7a769",
     "sha256:2f016b03975bb2d59e9546c0f4db6ce0339e01abc1905dfbcd5459a48757efd4",
     "sha256:55d2014c6889fb7e8c970c9a64cc8ddc940c6ae2326f21c8edb2491533cd034a"
    ]
   },
   {
    "name": "sha256:2425aef3fa33c5d4820c28435dd00f1b0575e7076d7b6ecd35bb2f5f7dceaa6d",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:2425aef3fa33c5d4820c28435dd00f1b0575e7076d7b6ecd35bb2f5f7dceaa6d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:21a2c2b0eb50dd4f55567d1c384282e6ee3225b65b69067b01704cd5dc739819",
     "sha256:9623c55c585ee828435b1c4f165062e42f51d859a78c3eca1a8fa852f5bf2ecb"
    ]
   },
   {
    "name": "sha256:7bf61fbb923a11ed806e4c2403189b4a22f6f3d38869334d160c78da3db72da3",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:7bf61fbb923a11ed806e4c2403189b4a22f6f3d38869334d160c78da3db72da3",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:a5795d7f520573b30b9f938d64f50387a525a4ab49846d85aaba6f1df484238e",
     "sha256:3db9098009e0eed80f5b1d8149883956c2daded3b07df340f9b1ec1e847d0700"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:9e3fa922c7d390a2c897964e72f01a3656214c60aa9c6f93a1bde41aacd9a7c5",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:9e3fa922c7d390a2c897964e72f01a3656214c60aa9c6f93a1bde41aacd9a7c5",
    "tagSymlink": "88d21732",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:7f1ef78c8e86c593a29f5a263fe2db2956e200107e9c557195dd1b1d58555faa",
     "sha256:2425aef3fa33c5d4820c28435dd00f1b0575e7076d7b6ecd35bb2f5f7dceaa6d",
     "sha256:7bf61fbb923a11ed806e4c2403189b4a22f6f3d38869334d160c78da3db72da3"
    ]
   },
   {
    "name": "sha256:7f1ef78c8e86c593a29f5a263fe2db2956e200107e9c557195dd1b1d58555faa",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:7f1ef78c8e86c593a29f5a263fe2db2956e200107e9c557195dd1b1d58555faa",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:3a5af6a324bed0e44edfbb9045ab4242b4bbaf5403cdcc47191f76dff74a7df8",
     "sha256:30f94741512b7c0f4e6214528d7f2a3d65db3c3d24051d711e20eee49ed34a13"
    ]
   },
   {
    "name": "sha256:d828aab4db3bb853a9c2be53ef65e968e7dca8faacb480e9c6802093181a8f16",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:d828aab4db3bb853a9c2be53ef65e968e7dca8faacb480e9c6802093181a8f16",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
     "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
     "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
     "sha256:7352f6cea50f341954464f598ddf182fd414905a0b3cc020549825ce4eccb4ed",
     "sha256:331b043fd43034caacd17a71f6de0c62323033f4cafb9fdbf056f6142610c1d2"
    ]
   },
   {
    "name": "sha256:f41411e6c6d65e52a3e3bb6cf3582116646e8ebc4ae9bf8eac77a00433855b20",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:f41411e6c6d65e52a3e3bb6cf3582116646e8ebc4ae9bf8eac77a00433855b20",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
     "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
     "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
     "sha256:b4198b1ff04aa2895ea9fb561adcb5df449c704e7f12d9c553b23cbb001d52f6",
     "sha256:433973506b0b8542d3e99ec17a3d438f1986580e1efc0d9f9f1e251e4822290f"
    ]
   },
   {
    "name": "sha256:9de4f6848556d362dab3fcc534a6e7098649b353139d1b8d796317b8474125c2",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:9de4f6848556d362dab3fcc534a6e7098649b353139d1b8d796317b8474125c2",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
     "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
     "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
     "sha256:57fdd7495851586b4f6cf5677ac8be6b46dd205ea0f853e3b4326b08962f3517",
     "sha256:aa81ad7ca7d9e5050e282444fdb0ead73be5cdc2ffa19d80677d353303744613"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:e686b5214871c516a7f5b6b03be43126de363c3c47630440a1dd2f42c2d49aee",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:e686b5214871c516a7f5b6b03be43126de363c3c47630440a1dd2f42c2d49aee",
    "tagSymlink": "123ba8ef",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:d828aab4db3bb853a9c2be53ef65e968e7dca8faacb480e9c6802093181a8f16",
     "sha256:f41411e6c6d65e52a3e3bb6cf3582116646e8ebc4ae9bf8eac77a00433855b20",
     "sha256:9de4f6848556d362dab3fcc534a6e7098649b353139d1b8d796317b8474125c2"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:9a029ef220e1ff32bdb95be3221803d68f3550fdb2a75a241adf89b447636e43",
    "path": "odf4/mcg-operator-bundle",
    "id": "sha256:9a029ef220e1ff32bdb95be3221803d68f3550fdb2a75a241adf89b447636e43",
    "tagSymlink": "54dca07e",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:5a24b559d7fcba235c62f82a22aee85c5140230813a744fc43153b1d074fba35",
     "sha256:ce751eb60f2b4522435b3e30d92deba8bdbf08941a29df4aee57f42ef1157960"
    ]
   },
   {
    "name": "sha256:5e83e64efba36b0a3181c346a129bdfe449beeb424a6e27e6e0dc1cf55030617",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:5e83e64efba36b0a3181c346a129bdfe449beeb424a6e27e6e0dc1cf55030617",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0a21bb5475ea5fbcfdeab2bbe08a1cf4ef0b55382d553d2c213620763078223c",
     "sha256:38dd71adcfc1f964c6f3ba6ae3b6daa95f612681cfb05298b225bb6347942f56",
     "sha256:089450f9e18cf52c000683a6b8c6dbb3b03adea57902c427b26709afbe78a8d5",
     "sha256:8dd62dfa2966bbeb29717c3e4cf7a076bebe379ec22a251416097e280488fe67"
    ]
   },
   {
    "name": "sha256:1dd893fd1b62cc70d2006fb4bf26a6af302b4052626f0a27849217c111537215",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:1dd893fd1b62cc70d2006fb4bf26a6af302b4052626f0a27849217c111537215",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3abc8c0d3d4265b5efb17447cd4a399fc70858b08d7cd5dce88dca7a09bc089",
     "sha256:ada7e11fb107d011a3b016cc659ca3f138f11725949328d92d3714ac15ef4ce2",
     "sha256:9ec07bbf47f0a21053e851d540e0dc713a0cf4570898750f659a3a9c8d783dca",
     "sha256:8c7ff62ae1f9a5cc24a5e2479d6cf9610b9c25086584f78cf02c0fce978e111b"
    ]
   },
   {
    "name": "sha256:b194288242da1d3c2224c15882b25777bf8c13f25a3894256d8a91d95bfc29ed",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:b194288242da1d3c2224c15882b25777bf8c13f25a3894256d8a91d95bfc29ed",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92559d5f5a908101d2776f8e756d73806b2bd3354be51e12d3111c90a4f09b07",
     "sha256:083e3eac55c875258c6477c979a400f62751e489a5aa9ffbbf0bf0bfdf773bcf",
     "sha256:83edb43944ff4d38439b9816947450429f8a021c11f34dc703e704265d58ae89",
     "sha256:a194a6c5c0ff3a3bbec22a4b7eccaa29353cac7bf94d121a6c3e7823c1b20f07"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:40da9aaf63ead51b72bc2a25e36f2a178fbbc404653b7c90dc1f36e1c191316b",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:40da9aaf63ead51b72bc2a25e36f2a178fbbc404653b7c90dc1f36e1c191316b",
    "tagSymlink": "9f217696",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:5e83e64efba36b0a3181c346a129bdfe449beeb424a6e27e6e0dc1cf55030617",
     "sha256:1dd893fd1b62cc70d2006fb4bf26a6af302b4052626f0a27849217c111537215",
     "sha256:b194288242da1d3c2224c15882b25777bf8c13f25a3894256d8a91d95bfc29ed"
    ]
   },
   {
    "name": "sha256:cb9fa81ad202bfedb04bc3242ffd582d49f0e8094069cba17ba694a2f03170dc",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:cb9fa81ad202bfedb04bc3242ffd582d49f0e8094069cba17ba694a2f03170dc",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:29456d9c1395da0c1137382990037cd7156529ab4f2f6ba7362c7831be0e5aba",
     "sha256:a533c8eb46bed38829bd955d62fcfc72a5b7462d7fcf577c8616eed95d77a387"
    ]
   },
   {
    "name": "sha256:5e16ecbc471f13a88d6765b0833083361ca7b83aead711c1e266ecbc9ebd09b4",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:5e16ecbc471f13a88d6765b0833083361ca7b83aead711c1e266ecbc9ebd09b4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:b57a127d7cb70f5bfd3ffc655c49f4c0f6a776eb2ca2d717f963363da0733850",
     "sha256:45be7a8aa4b236a278c158854ff3f3216b06841340e370881c01b54cf2cbb19e"
    ]
   },
   {
    "name": "sha256:45949fe9484182da70a9372453e7bf02666580cd01c9d4af0404358b5d926262",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:45949fe9484182da70a9372453e7bf02666580cd01c9d4af0404358b5d926262",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:5ab1765f2b82b314c00dc97fe155c7658553fec29a616bf23f90a5bae4984bc7",
     "sha256:5c9a035308b152714b6a34829afc31586c15fbc00ade48e8d90a233263ee42a5"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:b1973f451d16bbe48a3bd1cba22019724c4de8252baf52c8f09239b8e7434e64",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:b1973f451d16bbe48a3bd1cba22019724c4de8252baf52c8f09239b8e7434e64",
    "tagSymlink": "a38faf14",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:cb9fa81ad202bfedb04bc3242ffd582d49f0e8094069cba17ba694a2f03170dc",
     "sha256:5e16ecbc471f13a88d6765b0833083361ca7b83aead711c1e266ecbc9ebd09b4",
     "sha256:45949fe9484182da70a9372453e7bf02666580cd01c9d4af0404358b5d926262"
    ]
   },
   {
    "name": "sha256:e5bb9d16b247158c4a5d93cb6ceb446c17d030cf20c5f1b62e57b119c676ca7b",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:e5bb9d16b247158c4a5d93cb6ceb446c17d030cf20c5f1b62e57b119c676ca7b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:450cad02d0d66b492658a5ddb98d575ebef5ed97205f2239e0486686eddf55b5",
     "sha256:da15705755806d939ec3b5d51514579df1950857c14d886f1717c0a3b8b568dc"
    ]
   },
   {
    "name": "sha256:06e4f3982d520f57ac362ba6ca551f79fb310df96dc7053d5c616e53306eb043",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:06e4f3982d520f57ac362ba6ca551f79fb310df96dc7053d5c616e53306eb043",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:0cc66b0aae8017087ac213a7c21346695ceb29e42180f60be8a14d023e397785",
     "sha256:36e6f843028650ab26b7ff3f16c47c5d6a6d437a5615bbdc6bcc6613a86ec252"
    ]
   },
   {
    "name": "sha256:d679eb84fb52b74491e370cbfbeda5b5982fccc3f5e77038dd850e9ce0dc04a9",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:d679eb84fb52b74491e370cbfbeda5b5982fccc3f5e77038dd850e9ce0dc04a9",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:a03aaa33ce481b181671abdeb1aabf7f988f3f541afec7d59138ecbdc75dc50f",
     "sha256:0d65f5cb2f54ab0ff4b05aa9134c33f9316818128ca61a1daae125ccc1edfb21"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:af1e3b76a959bc9570f7347fa1515045e7f7a81ee025e45d0afeff2b3532ae18",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:af1e3b76a959bc9570f7347fa1515045e7f7a81ee025e45d0afeff2b3532ae18",
    "tagSymlink": "eab45936",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:e5bb9d16b247158c4a5d93cb6ceb446c17d030cf20c5f1b62e57b119c676ca7b",
     "sha256:06e4f3982d520f57ac362ba6ca551f79fb310df96dc7053d5c616e53306eb043",
     "sha256:d679eb84fb52b74491e370cbfbeda5b5982fccc3f5e77038dd850e9ce0dc04a9"
    ]
   },
   {
    "name": "sha256:bf7abafebdc61929688d81849954afe39f365592926432d143622a2349e18b3e",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:bf7abafebdc61929688d81849954afe39f365592926432d143622a2349e18b3e",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:1e09a5ee0038fbe06a18e7f355188bbabc387467144abcd435f7544fef395aa1",
     "sha256:0d725b91398ed3db11249808d89e688e62e511bbd4a2e875ed8493ce1febdb2c",
     "sha256:f067a2171519f6efa558f247bcc4c83245e5171d2febd0708e133308319340a6",
     "sha256:e45d4806fc5a2adf1d77e7cac12fb77b4f93c696635fa5a21a5fe8f8b03ec06a"
    ]
   },
   {
    "name": "sha256:74d9f6ff54a22e2b9174af3dee084e40ed7091a8b7a4075f5343415f23ca59c7",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:74d9f6ff54a22e2b9174af3dee084e40ed7091a8b7a4075f5343415f23ca59c7",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8ae94d44715e38323c503f34985d4dae431ad8c200aaffd1806ec5c6b2f9c2f",
     "sha256:d2476c1919664b73a98495ff6e8d395a5c7cd0a461f1c80d6eb985d1c001303e",
     "sha256:cd04d6eaa056b65dcc08032c5d40e7bfba43a93e0dace3a2af02dc13dcee7017",
     "sha256:a5030821dfa905e8dff87b6a1727d2e6f2b4f47ff46febcb0c17964eba809912"
    ]
   },
   {
    "name": "sha256:b47a04594a1dd6074eaca096b1c5209c369d53dfba601a1be4b1149a967579ad",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:b47a04594a1dd6074eaca096b1c5209c369d53dfba601a1be4b1149a967579ad",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e9459e3a98cc790007c3680dd8b292ea532d820ea8cbdf02344fe6c370d82a95",
     "sha256:f3992bbd282187c79c59ab9612f11590577b44953233c624e1700082117db955",
     "sha256:f3f2d9b9fa1ca1891520d2dbc1a0e79ceae3521196ebe5673a7cafac0e08b7d9",
     "sha256:956aef7f0a73f20291792e142b1eb920693f3ae97ff129f627f31bb59d769c67"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:7de13e9bc57cf408d805b91eba5d6062407bc725aed03aadf1905874a9580d88",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:7de13e9bc57cf408d805b91eba5d6062407bc725aed03aadf1905874a9580d88",
    "tagSymlink": "21b9a7f2",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:bf7abafebdc61929688d81849954afe39f365592926432d143622a2349e18b3e",
     "sha256:74d9f6ff54a22e2b9174af3dee084e40ed7091a8b7a4075f5343415f23ca59c7",
     "sha256:b47a04594a1dd6074eaca096b1c5209c369d53dfba601a1be4b1149a967579ad"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:28161864968ee4dc66ed6600697c469c714538cf27c66a2096e4443a6eef52b4",
    "path": "odf4/ocs-operator-bundle",
    "id": "sha256:28161864968ee4dc66ed6600697c469c714538cf27c66a2096e4443a6eef52b4",
    "tagSymlink": "2084f3fc",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:c851fdb05276a6cc20324758208cfe0683e3c8c6a6641fd6cb2ca6d116b0bc0e",
     "sha256:425a9a93735df8980a8e989e93b87602e4d0bade3b3cc578e90067b8b3a66e84"
    ]
   },
   {
    "name": "sha256:1896ab7cbfc4ade742b23ca45f410a1c58a520095c2507619c3346afec125ecc",
    "path": "rhel8/postgresql-12",
    "id": "sha256:1896ab7cbfc4ade742b23ca45f410a1c58a520095c2507619c3346afec125ecc",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0c673eb68f88b60abc0cba5ef8ddb9c256eaf627bfd49eb7e09a2369bb2e5db0",
     "sha256:028bdc977650c08fcf7a2bb4a7abefaead71ff8a84a55ed5940b6dbc7e466045",
     "sha256:c37fd7de0840b4031b29e532b9c694c59a63983ae93162a2e6476882cd075b21",
     "sha256:eb55064625198fee2c7b102ec4a86e8f3110864a72f45041fd78aa10686f9ae7",
     "sha256:da3d006ac2e20d38e2b4e63ded82e410a21d6fd69644bcabcb77eb724b28c1c0"
    ]
   },
   {
    "name": "sha256:013d9491ebfcc75974b26be0190c3eebe83c2546ea633f2076cc53095447bd35",
    "path": "rhel8/postgresql-12",
    "id": "sha256:013d9491ebfcc75974b26be0190c3eebe83c2546ea633f2076cc53095447bd35",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e0444ce29df7b754434fd4557ec395c5a1759e4af71c3615a81471e0c7edeadc",
     "sha256:18ea5ce2a404500d5dfadf661ec0566faf7380e56b05ed37735b93844ed5faaa",
     "sha256:a1acc2fd53cd4b8369b226d144c216d25d9c1a380745768f496afbc3f48a1298",
     "sha256:3b395c8c1e1a887da992d3fe67608386c765d39dc9c021ae9d50073d63053fcb",
     "sha256:5e4093b5f995d8570e4f76f901e1bad01dd1ef2472faecfa3ffbe968cf1ae71e"
    ]
   },
   {
    "name": "sha256:e9bb1955d0ae13cd0b57f426cf510e1e25aac8abf0ad3230b70484dfdce46865",
    "path": "rhel8/postgresql-12",
    "id": "sha256:e9bb1955d0ae13cd0b57f426cf510e1e25aac8abf0ad3230b70484dfdce46865",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:7472fa517fd188919c3ff6ec27806dd20311bb57e1e34a7f3998734688fa7b42",
     "sha256:9f6eca53e5bceb7b88b4c078cc5d939e61d13301d8bdccb6b68eeea4d3879f3e",
     "sha256:c54fd38fa8e85b2fb449666efa98198e9664b52a6f3602c0a4a8667186f12b99",
     "sha256:586b16a4389b3b03acd8a98cbea0760370b1b4f1252a343fd9690a236798a403",
     "sha256:a17692caa614cc975b3c585687f9de1bf8f08102c4090c9978bbbe65b9e62c53"
    ]
   },
   {
    "name": "sha256:559305a63c719d170e76746bffb2ce15cde7f4e1fd9380d384508d72d0d52516",
    "path": "rhel8/postgresql-12",
    "id": "sha256:559305a63c719d170e76746bffb2ce15cde7f4e1fd9380d384508d72d0d52516",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:744db8e918c5c882f601488dcdbe3c4e9fa01913fe57119975eb5b16a18f6250",
     "sha256:d851aca55b090483dcda2af05dbf048848399647d96dd3d4089f92d35f827db7",
     "sha256:1ec3039ee2083ddda0023477b8b6ce4953997b4ca67abdeae1be577be165745a",
     "sha256:af93f624f4a84ab6ad66020b46c4ca4733cc4a6c22903e1e3147ca5c85e88821",
     "sha256:ee297db47bdb3c82fa42aec2c69bee6f395c8bb32c21037e054e3bdce776d763"
    ]
   },
   {
    "name": "registry.redhat.io/rhel8/postgresql-12@sha256:81d9bf20387ecfa85bf24dd53167242393075544a4368636a4bbda79d8769f49",
    "path": "rhel8/postgresql-12",
    "id": "sha256:81d9bf20387ecfa85bf24dd53167242393075544a4368636a4bbda79d8769f49",
    "tagSymlink": "e4bfb87a",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:1896ab7cbfc4ade742b23ca45f410a1c58a520095c2507619c3346afec125ecc",
     "sha256:013d9491ebfcc75974b26be0190c3eebe83c2546ea633f2076cc53095447bd35",
     "sha256:e9bb1955d0ae13cd0b57f426cf510e1e25aac8abf0ad3230b70484dfdce46865",
     "sha256:559305a63c719d170e76746bffb2ce15cde7f4e1fd9380d384508d72d0d52516"
    ]
   },
   {
    "name": "sha256:cf3288eba18c7ccb414d1de199167f02b65eaafcfec317385a2732863139c4ed",
    "path": "openshift4/metallb-rhel8-operator",
    "id": "sha256:cf3288eba18c7ccb414d1de199167f02b65eaafcfec317385a2732863139c4ed",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
     "sha256:e37a81a9ad13c7b79c0766bf92762a161852627fa24f74b189b3ef5ad8f8e2e0",
     "sha256:7eff185d5f9109108d5ad700998bb5eab383e75d39fc0d0fc5daafe41460e639"
    ]
   },
   {
    "name": "sha256:7dc831bdb6b1e7acfea4647455bcc1916a7139bc86e7e0c882765cacd1640e6d",
    "path": "openshift4/metallb-rhel8-operator",
    "id": "sha256:7dc831bdb6b1e7acfea4647455bcc1916a7139bc86e7e0c882765cacd1640e6d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
     "sha256:e0aede7a39b077a043c4afe328adc38cd46676df60f111bca16ea81de49c350a",
     "sha256:3a99e0036d0e71dcf887b00a3f3abbfb876613dba8dc1ed57e6bafcf5510c9c6"
    ]
   },
   {
    "name": "sha256:72dfdf2bace595308dfeff25e20f9de32793b2b8facb62699e16dc2740d36310",
    "path": "openshift4/metallb-rhel8-operator",
    "id": "sha256:72dfdf2bace595308dfeff25e20f9de32793b2b8facb62699e16dc2740d36310",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
     "sha256:b67bd9d1a77b8b682a53f693c686c973a5327b4d6382f9517384508ab322302f",
     "sha256:187bdfdcbb098bc9f88782b1de9e547ae55532eea363fc9cb6a05134be2f57f1"
    ]
   },
   {
    "name": "sha256:eada77e33decfbae781518352f8ec742950dec65daafcad1171e29c6e69087ee",
    "path": "openshift4/metallb-rhel8-operator",
    "id": "sha256:eada77e33decfbae781518352f8ec742950dec65daafcad1171e29c6e69087ee",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
     "sha256:47587ce7e2e16b65094c279910d7c665204abeebaa177d00780732d5449d2dd1",
     "sha256:e49b44504fc1fe4f5ccf4c33b23dc47579c8b9f3098264b11c552ed4b9ca183c"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/metallb-rhel8-operator@sha256:772f41acc4cd467ad0e93db4bec2277754aa644d69849028a2fd50504fce4886",
    "path": "openshift4/metallb-rhel8-operator",
    "id": "sha256:772f41acc4cd467ad0e93db4bec2277754aa644d69849028a2fd50504fce4886",
    "tagSymlink": "18d6c080",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:cf3288eba18c7ccb414d1de199167f02b65eaafcfec317385a2732863139c4ed",
     "sha256:7dc831bdb6b1e7acfea4647455bcc1916a7139bc86e7e0c882765cacd1640e6d",
     "sha256:72dfdf2bace595308dfeff25e20f9de32793b2b8facb62699e16dc2740d36310",
     "sha256:eada77e33decfbae781518352f8ec742950dec65daafcad1171e29c6e69087ee"
    ]
   },
   {
    "name": "sha256:bdc3a345f5335516655df819a147335be5f030d72c8e65c9710ca44c284cd835",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:bdc3a345f5335516655df819a147335be5f030d72c8e65c9710ca44c284cd835",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0c673eb68f88b60abc0cba5ef8ddb9c256eaf627bfd49eb7e09a2369bb2e5db0",
     "sha256:028bdc977650c08fcf7a2bb4a7abefaead71ff8a84a55ed5940b6dbc7e466045",
     "sha256:9357605515b793a689a4dd667c15a2404e63c086e55639da8c8e881720096f10",
     "sha256:eac161fbca94bcae58951102856d6fff82530aa9eb71bac2e26ffc7c1fe36c50"
    ]
   },
   {
    "name": "sha256:4557ce62ccc0f9762ce23a1970c9a5b90441361c7feabc8a50355349b961fd01",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:4557ce62ccc0f9762ce23a1970c9a5b90441361c7feabc8a50355349b961fd01",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:7472fa517fd188919c3ff6ec27806dd20311bb57e1e34a7f3998734688fa7b42",
     "sha256:9f6eca53e5bceb7b88b4c078cc5d939e61d13301d8bdccb6b68eeea4d3879f3e",
     "sha256:9a2bbe77a39ae999b29887d95f1b3bd5dfa19edc75b02b05a89e60d3fa059823",
     "sha256:b39ad9bca723c8ac86e739d746f854a3be0394f61b1a64d19ccd5f8543a2c744"
    ]
   },
   {
    "name": "sha256:e152564503077c3f0ccbe73572a1523be7cb2c0e8d5b294ade00e90553f6938d",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:e152564503077c3f0ccbe73572a1523be7cb2c0e8d5b294ade00e90553f6938d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:744db8e918c5c882f601488dcdbe3c4e9fa01913fe57119975eb5b16a18f6250",
     "sha256:d851aca55b090483dcda2af05dbf048848399647d96dd3d4089f92d35f827db7",
     "sha256:b88808630d432022586dd95d3f13c809a7847e97b63ec829933acda17029a493",
     "sha256:628587eea60cf36740c95479f583173b5ce2a053923c7eb888d2b57db635277c"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:65c4b98de58f052d1e2650fc356a3e828364b048289a38186564c95b1a5f7a85",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:65c4b98de58f052d1e2650fc356a3e828364b048289a38186564c95b1a5f7a85",
    "tagSymlink": "ed266c37",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:bdc3a345f5335516655df819a147335be5f030d72c8e65c9710ca44c284cd835",
     "sha256:4557ce62ccc0f9762ce23a1970c9a5b90441361c7feabc8a50355349b961fd01",
     "sha256:e152564503077c3f0ccbe73572a1523be7cb2c0e8d5b294ade00e90553f6938d"
    ]
   },
   {
    "name": "sha256:4338ea20fce25b664e880066144a5de7769623373cbfde1f46666aace4d9b855",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:4338ea20fce25b664e880066144a5de7769623373cbfde1f46666aace4d9b855",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3de00bb8554b2c35c89412d5336f1fa469afc7b0160045dd08758d92c8a6b064",
     "sha256:c530010fb61c513e7f06fa29484418fabf62924fc80cc8183ab671a3ce461a8e",
     "sha256:17f3bc201fde99cc5e67b378fb79e032d5d79274422ec34589b7418927debd79",
     "sha256:22be94f7d9c863e9133909fb0b3c166baafd5020df53e9832e3f04aebfa74745"
    ]
   },
   {
    "name": "sha256:4ed1db89bdd6150f28721a3c18bcfa7e221b1b621c12ae8830fd35923dea08ca",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:4ed1db89bdd6150f28721a3c18bcfa7e221b1b621c12ae8830fd35923dea08ca",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:2cbc2866f0e2741aa3c72c6a699db0f8b25a5a5fea7d49ee2aa4f9a97ec6ee4c",
     "sha256:17e3a5f768e10e019b5bf765f63f8f9243bdfc7856b6c5b92b2b93430a7a91e7",
     "sha256:9171aef8701e941ef919fc22322282382714b67e64a53252a5ee2f179769f4ce",
     "sha256:e167207bb45f8218a9988bf503cc101cc7a76e7f4770b1e62ccb3cd19f75ebfa"
    ]
   },
   {
    "name": "sha256:f2a35675f04b3852dadbea99fef57dcc85ab5670929f7b0d52981e227047123c",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:f2a35675f04b3852dadbea99fef57dcc85ab5670929f7b0d52981e227047123c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:bdee7855ef43f1c1d40221634c315c1998e5ee6f976d77dec4834f669bee371d",
     "sha256:df8985aa78d66ad0ca1e65cdf78c0a770212de626074c34770d25b8dcfc5e4bf",
     "sha256:0a1de9f30b5b86a3d2847eb4ce3a8dd4349695494b85a7f1990f40bc2c8242ba",
     "sha256:3b3e9f3d7c585aa8e61318f85327abee55143a9047afdf41407312b27292e4e2"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:4ff2d65ea16dd1026fe278a0f8ca920f300dfcee205b4b8ede0ab28be1aa43a6",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:4ff2d65ea16dd1026fe278a0f8ca920f300dfcee205b4b8ede0ab28be1aa43a6",
    "tagSymlink": "80537000",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:4338ea20fce25b664e880066144a5de7769623373cbfde1f46666aace4d9b855",
     "sha256:4ed1db89bdd6150f28721a3c18bcfa7e221b1b621c12ae8830fd35923dea08ca",
     "sha256:f2a35675f04b3852dadbea99fef57dcc85ab5670929f7b0d52981e227047123c"
    ]
   },
   {
    "name": "sha256:debce175867e502bc7c60b16ed5b8dcae89df8867c43786796764a2895ba0ed7",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:debce175867e502bc7c60b16ed5b8dcae89df8867c43786796764a2895ba0ed7",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
     "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
     "sha256:076d705c5799a9c5fe30eabcba203ca0c57e05d3685d80d9870fff514dae2c06",
     "sha256:2dc2e749421708d0739bde49c23866fd4dd690b846c0a64025dd4ea6432afe64"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-provisioner@sha256:106141d7e11e5495f75f497d0eeab106080224a504d3792501bd61722902bbfe",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:106141d7e11e5495f75f497d0eeab106080224a504d3792501bd61722902bbfe",
    "tagSymlink": "d104921b",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:8afbd420cf7d7662f61adee70305e8dc4f13db6a45a15a896a3ef889dfd54957",
     "sha256:654621110229e306eb113bf1fe84d0cc486567fd609f5302a0be9a0498b2800f",
     "sha256:4072ec25e2a30d8e065467cddefea624a674d18cba76d44869459352d6cd5963",
     "sha256:debce175867e502bc7c60b16ed5b8dcae89df8867c43786796764a2895ba0ed7"
    ]
   },
   {
    "name": "sha256:8afbd420cf7d7662f61adee70305e8dc4f13db6a45a15a896a3ef889dfd54957",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:8afbd420cf7d7662f61adee70305e8dc4f13db6a45a15a896a3ef889dfd54957",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
     "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
     "sha256:5944fe0396dfe30076bf4dabe0d03e5860bfa1aad765410684ea2de66683c59b",
     "sha256:a381e681640566d2d3d0cf0f2ebc5bf46195ca2ad340c06cf1ff4e1304a68d39"
    ]
   },
   {
    "name": "sha256:654621110229e306eb113bf1fe84d0cc486567fd609f5302a0be9a0498b2800f",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:654621110229e306eb113bf1fe84d0cc486567fd609f5302a0be9a0498b2800f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
     "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
     "sha256:5cc9efb5115bff872c1403eade99bc17cf2a42bd46db6885378e3c2463038506",
     "sha256:2590653bbf92a4215733c1c74b296c787758646c3a0b07de42a00233b2e2eea1"
    ]
   },
   {
    "name": "sha256:4072ec25e2a30d8e065467cddefea624a674d18cba76d44869459352d6cd5963",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:4072ec25e2a30d8e065467cddefea624a674d18cba76d44869459352d6cd5963",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
     "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
     "sha256:1b8df5295ddcc472fd632293bb6f47857c6797bcfff9747411f8965290e8e89d",
     "sha256:eb09e326a0e07484015fff3742e4f135930712b68a5e82b2df4b3073dc255290"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:e1ae5ed85e17ad3cdbdc5049f5c3064f2616c5a6f445ec9d38e7f915d494776b",
    "path": "odf4/mcg-operator-bundle",
    "id": "sha256:e1ae5ed85e17ad3cdbdc5049f5c3064f2616c5a6f445ec9d38e7f915d494776b",
    "tagSymlink": "8d55c08f",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:c0623c3007249c90f82a7125f2118db2989ec342792cde89b0de0cb5f969f8d6",
     "sha256:34d2f8fc28425411f63f7265e8e2972076b6df6e3aead514a9500a703e3e67ec"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:80897f0ac2df4039b98cfda43118d2b00f4ccef9a9495e733dfaab75ab1ecfb0",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:80897f0ac2df4039b98cfda43118d2b00f4ccef9a9495e733dfaab75ab1ecfb0",
    "tagSymlink": "ea90b48f",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:d16ddaa0ad8cbcc8b4dbece29779a8fcefa7b18ec4e6ccdbfa0cd374ccb5f592",
     "sha256:38d153287be86f706708535a296df8fa8493371f29dbed91a5e2849bd7ffc903",
     "sha256:f0573f468343e29db8cea708332c1f35be912f5c71afc2ed030f9057c99d8c9b"
    ]
   },
   {
    "name": "sha256:d16ddaa0ad8cbcc8b4dbece29779a8fcefa7b18ec4e6ccdbfa0cd374ccb5f592",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:d16ddaa0ad8cbcc8b4dbece29779a8fcefa7b18ec4e6ccdbfa0cd374ccb5f592",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:c4e8dd83aa6fbb4f16a96651133f0045346d7c27be55fa2f30e95b3819a27597",
     "sha256:5e981ffaf446f31de66d26202336a0148a86ac5b5f94509507c106d2d7b058f7"
    ]
   },
   {
    "name": "sha256:38d153287be86f706708535a296df8fa8493371f29dbed91a5e2849bd7ffc903",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:38d153287be86f706708535a296df8fa8493371f29dbed91a5e2849bd7ffc903",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:6a003ca6c746424a0a402f7dd38b9c0580a777d271908662025a4e567776cd72",
     "sha256:2c57b5b4658eb714755984871031648fa0a11f2a462db90c2c0994162c75afe4"
    ]
   },
   {
    "name": "sha256:f0573f468343e29db8cea708332c1f35be912f5c71afc2ed030f9057c99d8c9b",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:f0573f468343e29db8cea708332c1f35be912f5c71afc2ed030f9057c99d8c9b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:f43de919108993052d3c3cd786ea713b7fbade1fd6e9f62b971f5245a8dc00fd",
     "sha256:beab3ada94eaec6c2a0f3e24cab4148d716bad8638e96c19991791c1c0664d0d"
    ]
   },
   {
    "name": "sha256:ab39376e9dc15cb2223bfbaf286d23dd6455420dc9808578dc62a57fb2395cbb",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:ab39376e9dc15cb2223bfbaf286d23dd6455420dc9808578dc62a57fb2395cbb",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
     "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
     "sha256:47885edc5104636172fa5dde611aaa39c2a4277e5a740c959ea6bd8d731efaff",
     "sha256:0c8db35d43dd3f169f26cf4bfd2dcf7616a04b19683c91b41017d4553968e689"
    ]
   },
   {
    "name": "sha256:2f6409e1ab97cc65027f0f5a1cf90941c2274faba2693735f88259a1afea1751",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:2f6409e1ab97cc65027f0f5a1cf90941c2274faba2693735f88259a1afea1751",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
     "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
     "sha256:4c8a2ab2d39b895c6dfafca42e978a9fc9daeeceffbb721ee9c2b33cafa1fd08",
     "sha256:3f716573f90c656f0a042273957678a1adfab55ce31337c9257a6b251907d107"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:84a562d0337bbac13c098bee7eb29f383d2e1b019b2d8fc823e68b19ce41be60",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:84a562d0337bbac13c098bee7eb29f383d2e1b019b2d8fc823e68b19ce41be60",
    "tagSymlink": "b6eac787",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:da5b291e453a4a25d4ad8ad079dcedf5cde8e91b253034fec226fb6e935fcd13",
     "sha256:ab39376e9dc15cb2223bfbaf286d23dd6455420dc9808578dc62a57fb2395cbb",
     "sha256:2f6409e1ab97cc65027f0f5a1cf90941c2274faba2693735f88259a1afea1751"
    ]
   },
   {
    "name": "sha256:da5b291e453a4a25d4ad8ad079dcedf5cde8e91b253034fec226fb6e935fcd13",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:da5b291e453a4a25d4ad8ad079dcedf5cde8e91b253034fec226fb6e935fcd13",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
     "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
     "sha256:924112c2904f81fb942f2784f9e4630b97826ca95e984756b553350bc2abd613",
     "sha256:68275358d02dfec82067228a78975841970b40b3fb3a10bbe5985aa0865cebb1"
    ]
   },
   {
    "name": "sha256:c8fc3444b36626b826dd62f7ad45a0a4af2673b788858127920d8d534651a85f",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:c8fc3444b36626b826dd62f7ad45a0a4af2673b788858127920d8d534651a85f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
     "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
     "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
     "sha256:03f28195da81fb472b0de7cbd0aa556ec83d2c9b69c91def562c8d7d8c8e2f74",
     "sha256:c47457eeebf0e8573449b5b0419f3df3a1c90d00f788e67ca4d85b85fb1b41fc"
    ]
   },
   {
    "name": "sha256:d0ba83b088e9bce552ca49ae02f5076563ba7c93718a307760b70c5a3ebc2e1a",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:d0ba83b088e9bce552ca49ae02f5076563ba7c93718a307760b70c5a3ebc2e1a",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
     "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
     "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
     "sha256:68f1149069d8db886176298713d2c37d798b69306b52d5e066db3f54d395ab0d",
     "sha256:34c0c6c8e22138e2d66e8635e77f5c13d7c1c758ffd659d73def463be880bed8"
    ]
   },
   {
    "name": "sha256:b760f319ed4a9ab09d2b01d9b8c9409c0e1f334e1aa9274efff844ae3e3230d2",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:b760f319ed4a9ab09d2b01d9b8c9409c0e1f334e1aa9274efff844ae3e3230d2",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
     "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
     "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
     "sha256:6474a192a0e0137957d6ec912ba1017f5d4137fa4f87d0fb68d676c7ccb6e3de",
     "sha256:98f095e8467608ae1ec16d62552e7ccb7ccceb8ad33bc4fdd9b0365f3474d797"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:6e6a505d33ebe7a8a8c4b7b9235bbb34347224ccfdfb2cc927d3b93b730725e8",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:6e6a505d33ebe7a8a8c4b7b9235bbb34347224ccfdfb2cc927d3b93b730725e8",
    "tagSymlink": "3939a5a",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:c8fc3444b36626b826dd62f7ad45a0a4af2673b788858127920d8d534651a85f",
     "sha256:d0ba83b088e9bce552ca49ae02f5076563ba7c93718a307760b70c5a3ebc2e1a",
     "sha256:b760f319ed4a9ab09d2b01d9b8c9409c0e1f334e1aa9274efff844ae3e3230d2"
    ]
   },
   {
    "name": "sha256:70164478169ef7065e5f66d8bf5f00fe7d175dead67dedf5505b561aa6d7bead",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:70164478169ef7065e5f66d8bf5f00fe7d175dead67dedf5505b561aa6d7bead",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
     "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
     "sha256:9e519d49a84dfed60862e1c8a580304a25a4a6ceb4c714dd03587062910cb4b4",
     "sha256:d2f09b060eb7a0dfbcb3eebc10a3459f8d82654623a459b94797eb821b4295d4"
    ]
   },
   {
    "name": "sha256:1b0d6122926d9cbbe1274b38c55c96d95687e7c090adc3c7afd20c3b8bf3b4a0",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:1b0d6122926d9cbbe1274b38c55c96d95687e7c090adc3c7afd20c3b8bf3b4a0",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
     "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
     "sha256:940bda011c42e014f9d9bb70a9789fa022e580411b562e7284e5a793dbfa2f22",
     "sha256:ad82ba4abcecb21c81b5c823a3b031f9f3c4c99b76a81ad87ce2b7fcadf55850"
    ]
   },
   {
    "name": "sha256:8fa68009539001e874798e193a43a72409a81d5903570d5620733b123788463f",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:8fa68009539001e874798e193a43a72409a81d5903570d5620733b123788463f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
     "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
     "sha256:b055867a7e29f3850fb03821be01324db9941e798777016531b0635b5b64287c",
     "sha256:1986f863075b70aed3ddac3e899225f9f422f97fb6ee3b7442861044f74987f2"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-node-driver-registrar@sha256:07963513c4699736be182a50f4bb11e215d0f95bffc5bb3c4fa88894df52e7a1",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:07963513c4699736be182a50f4bb11e215d0f95bffc5bb3c4fa88894df52e7a1",
    "tagSymlink": "2773ad99",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:719a14eba98e5e59888f7d77f5409456cfdc8af4864a111caa9de5390ff27dd7",
     "sha256:70164478169ef7065e5f66d8bf5f00fe7d175dead67dedf5505b561aa6d7bead",
     "sha256:1b0d6122926d9cbbe1274b38c55c96d95687e7c090adc3c7afd20c3b8bf3b4a0",
     "sha256:8fa68009539001e874798e193a43a72409a81d5903570d5620733b123788463f"
    ]
   },
   {
    "name": "sha256:719a14eba98e5e59888f7d77f5409456cfdc8af4864a111caa9de5390ff27dd7",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:719a14eba98e5e59888f7d77f5409456cfdc8af4864a111caa9de5390ff27dd7",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
     "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
     "sha256:c527dcd4c70dd833baed2781fd10197d3f92cca11c48058ade33575882a9c361",
     "sha256:017d8df1d807b7931983f2fbe399d65944fe794dc936d5d8fe00bc1bb7634fec"
    ]
   },
   {
    "name": "sha256:312cf09ee5bb8cf6b92f083e48f97ed3bfa7b27af2646e7a7e2e2594f1dc9dff",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:312cf09ee5bb8cf6b92f083e48f97ed3bfa7b27af2646e7a7e2e2594f1dc9dff",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4f639942cb5a04cfde9e90ad4590927d87ec970f46186ebe46182c2f0657584d",
     "sha256:261c17695cc21090e4719a05e282f024f0ab9a36997b3e3550ee7a97dee98668",
     "sha256:1b9bab37b81bf366fb024ce58af8e9548fb09b80f8c1212b2a02524b942181f3",
     "sha256:11233cc031a58f7b31f06644e1b138a8cdf720e69c4794421d89d55beb7eeee2"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:0d8f33ac4bdc4bb095bcfc4e32ddf44b110a48cc44d1b1bda8ca5dd4cccb72a4",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:0d8f33ac4bdc4bb095bcfc4e32ddf44b110a48cc44d1b1bda8ca5dd4cccb72a4",
    "tagSymlink": "4495708c",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:4677fa33897f97cc48709dbc217b580edfdc0e7d3d60399fad2e32b2dc78452b",
     "sha256:88fc354349a6b8025b129114ed504c20eb82dbbac942d7150fca49adea7e1eb3",
     "sha256:312cf09ee5bb8cf6b92f083e48f97ed3bfa7b27af2646e7a7e2e2594f1dc9dff"
    ]
   },
   {
    "name": "sha256:4677fa33897f97cc48709dbc217b580edfdc0e7d3d60399fad2e32b2dc78452b",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:4677fa33897f97cc48709dbc217b580edfdc0e7d3d60399fad2e32b2dc78452b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:1b890c73c3cf60b04334fded9e3edc647d64dd39ffd078317e2bd69552a2fd1d",
     "sha256:de63ba066b7c0c23e2434efebcda7800d50d60f33803af9c500f75a69fb76ffa",
     "sha256:fd44f54cba95782d78c23422ec85c1569d551c44c887547be38cf0ebe2777729",
     "sha256:b6321c2f412b967ff97b0d4ff77bf9bb8007e3a4a013f64f48419abe9856dd27"
    ]
   },
   {
    "name": "sha256:88fc354349a6b8025b129114ed504c20eb82dbbac942d7150fca49adea7e1eb3",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:88fc354349a6b8025b129114ed504c20eb82dbbac942d7150fca49adea7e1eb3",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:9f78280d50082c329e73123d73b3debc7f5eec007d8a0c7b1d388ff69b9652fc",
     "sha256:a1a64b9c0d1a2a468c65bf81fb26d51416a3e19d95d08df39e5d7d012a25b685",
     "sha256:b8eed6d6be1ba11705a327cb865a21d9da22d92b757e4b368d6b0ece72bf671f",
     "sha256:c78156a192b3ac20cd70c704cf995186d09598d93b295dc43e64546e52c74ddb"
    ]
   },
   {
    "name": "sha256:ea23690e3517b7e6212482b880bea41daa66ac9713253a11e345bfaab3ad8e1d",
    "path": "rhel8/postgresql-12",
    "id": "sha256:ea23690e3517b7e6212482b880bea41daa66ac9713253a11e345bfaab3ad8e1d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:9bd1aeb0dd8f02cb3837d0da41cb72c0eca2738d78553e7556b7a57d41012a72",
     "sha256:e0290a08d28ca7906f03c9a30fcc51aba34c55ed37079e56e88c7f2c1108020c",
     "sha256:5c18d94fb93b0299d5e960fd7ca6581bf7f9184e7c0d17f34cadae28e741a2bb"
    ]
   },
   {
    "name": "sha256:c8fd6d640b44589c27c4431b5ac6b5a49dbdcc6b2cbca3286845dbe26a9efa92",
    "path": "rhel8/postgresql-12",
    "id": "sha256:c8fd6d640b44589c27c4431b5ac6b5a49dbdcc6b2cbca3286845dbe26a9efa92",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0f6e46285dbeaad8b2b8f01b5fe21771fc2b522ceafaf88d8f51ff88b51d87a9",
     "sha256:b88304ccd20b48c3e167431fdaa53db68d449caf91511ca66a32b356f947b6ea",
     "sha256:102321c26dfd3de3fddf16d8e4d8ff9137a0fa6a4a3db0c1bdf5aa1a14f33191",
     "sha256:554ef1aa8114e3ba74d27052d50e9f7d88a0f5ab0596c7506303b5bdbcc6ad4c",
     "sha256:a2c0db9951e54c202f0fcb530622d27e2da70911133dcd3d70eeb67298d9ec68"
    ]
   },
   {
    "name": "sha256:97756bcc5cae0b043353b693cb11f5462a48af525d0c7ff79ffff015cf986939",
    "path": "rhel8/postgresql-12",
    "id": "sha256:97756bcc5cae0b043353b693cb11f5462a48af525d0c7ff79ffff015cf986939",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:cfb0baf8b0d9c657e3a5767a37e7ecbb623e41b646d02307617959669421c025",
     "sha256:35f5c865fa426f65c506fb9bf6885bf0745a114ba8bbf5f7887df7efd376cb83",
     "sha256:d1f35ac7b77818bf17e5074c81ea99c9cf75f6182fb61f2ff47b4cf9207982a0"
    ]
   },
   {
    "name": "sha256:1833a9a1d5dcae60248c961e6e2ce3ff334b6999b0e36b9963eb49d01678c96d",
    "path": "rhel8/postgresql-12",
    "id": "sha256:1833a9a1d5dcae60248c961e6e2ce3ff334b6999b0e36b9963eb49d01678c96d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:9654b36842ecd85c9c3fbb548ba6cfb9aa28694df058bcffd37e4bf0895da0f4",
     "sha256:c8838c8699c7c4b47db4aa391b8e331e3d25be9f8968992cd44909a6fe309a49",
     "sha256:b80e261c7d88d9006592d7018eb16dbfd53042b4437561e762de8633dfa834ae"
    ]
   },
   {
    "name": "registry.redhat.io/rhel8/postgresql-12@sha256:66fa333966bf08f3ac0d5e270b6ffb03717b5b6a3df30663f88acfd3f8566d13",
    "path": "rhel8/postgresql-12",
    "id": "sha256:66fa333966bf08f3ac0d5e270b6ffb03717b5b6a3df30663f88acfd3f8566d13",
    "tagSymlink": "739f35b0",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:ea23690e3517b7e6212482b880bea41daa66ac9713253a11e345bfaab3ad8e1d",
     "sha256:c8fd6d640b44589c27c4431b5ac6b5a49dbdcc6b2cbca3286845dbe26a9efa92",
     "sha256:97756bcc5cae0b043353b693cb11f5462a48af525d0c7ff79ffff015cf986939",
     "sha256:1833a9a1d5dcae60248c961e6e2ce3ff334b6999b0e36b9963eb49d01678c96d"
    ]
   },
   {
    "name": "sha256:b290cb25e6e7417b120a4e19076a778ebd78c3ac5a657661dddbe2c280bd2769",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:b290cb25e6e7417b120a4e19076a778ebd78c3ac5a657661dddbe2c280bd2769",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d3b9a4a690bf1791b874c3495c6a8e2c039150b5882374cd9c42dd4bba68ba31",
     "sha256:a049ed70eeb87542c711449e14b6a7ccdde9ca2219d749fa0872aa755f2a89cb",
     "sha256:ed7ab2c89f7ad45e66ee453768e145ebb588b5a24b023c88cad737f2361e939f",
     "sha256:fcb00df42aef515369a37ab196cc361f2087449e40370eca401b32830e58de8c"
    ]
   },
   {
    "name": "sha256:bea3cd63c0d9a5f4f99e84714d4a374b51d0f3d27182e61cbf823584c2be7005",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:bea3cd63c0d9a5f4f99e84714d4a374b51d0f3d27182e61cbf823584c2be7005",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:02863a09124c1837ee0672a011fb7e2d5c95ae16af6b569f65d2e0f763127ddc",
     "sha256:97aead8e17dadf7e07e5153ee6d5a68d28e46847e01db6d9325742076043fd20",
     "sha256:da210814b21e3bbffc7570450e9713d7bf61a9d7caf5bebf5076314ade3900f3",
     "sha256:4b476ef09e348095f3a50bc4eb4d38a4d96e6ad4eebe25d9d33379f854d0674a"
    ]
   },
   {
    "name": "sha256:cbb119731f1173a3701112130824fe64650ebc2199fa442a1317e1fe4a712ef4",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:cbb119731f1173a3701112130824fe64650ebc2199fa442a1317e1fe4a712ef4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:220d447748c8866cbfeac8fb3534dd8d49cc8b99cc625041414c17d0f80e02ca",
     "sha256:8909629d32e7d0fef085a5fcee0e0f318367006d81be0d5da8e0a209ee230793",
     "sha256:6478431628b255e922b03c9275e15f65fbf2c9ba3c1d7f8556f8c2eb4182bff3",
     "sha256:7ba332f1930df17b2feff4d82f31c624c0ba22a0dfe40e73ddb8a75ca0d9f40f"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:752fe3d8d6c48b640d482dd592282ca3fb4fbed8b7b3caac3d43ceb152bccf78",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:752fe3d8d6c48b640d482dd592282ca3fb4fbed8b7b3caac3d43ceb152bccf78",
    "tagSymlink": "45c179f2",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:b290cb25e6e7417b120a4e19076a778ebd78c3ac5a657661dddbe2c280bd2769",
     "sha256:bea3cd63c0d9a5f4f99e84714d4a374b51d0f3d27182e61cbf823584c2be7005",
     "sha256:cbb119731f1173a3701112130824fe64650ebc2199fa442a1317e1fe4a712ef4"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:ecbd1c11787ec0a70afc230530f358ce104e553eb13d6093ec26ee80870da068",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:ecbd1c11787ec0a70afc230530f358ce104e553eb13d6093ec26ee80870da068",
    "tagSymlink": "4bd02eaf",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:32a1d52cfc7b91c0186e5423245bd06e525c6890ed77bca7335e56c48e2cd86b",
     "sha256:a3b3a3e9a8332d3b5d5137ff89e1843e6506507c2ebb069c9a7bbfcd03dfdd42",
     "sha256:9759e45e271ef502e2ed6f7e12dc2ecb10e39fc0cd22e195f7d47edec39ff0fd"
    ]
   },
   {
    "name": "sha256:32a1d52cfc7b91c0186e5423245bd06e525c6890ed77bca7335e56c48e2cd86b",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:32a1d52cfc7b91c0186e5423245bd06e525c6890ed77bca7335e56c48e2cd86b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:510abfcdf6bce7517c9dbde8fd24c03d8f36fe1503f65a712f824401f857aac7",
     "sha256:4a3604715398d774a2abb75d31b035aa4099557f7016e27550cefc9759368cda",
     "sha256:895b440f39821a2e4ddb80b53c39fc9e0b9954f53691b01360dc4484656c499d",
     "sha256:ae74c4523eff05b0ba9081b5fa78be34439c001362f5387aae145c43e46d48bf"
    ]
   },
   {
    "name": "sha256:a3b3a3e9a8332d3b5d5137ff89e1843e6506507c2ebb069c9a7bbfcd03dfdd42",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:a3b3a3e9a8332d3b5d5137ff89e1843e6506507c2ebb069c9a7bbfcd03dfdd42",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f2cdfe33b637eca2019910dbfd9c00211fe1aeda61fe42b23f08bb74a91e72f5",
     "sha256:6d9e8294c3485a103e1bccd5ab429804c39e30fa9217e9b8e15154afe93e3167",
     "sha256:a15f950c25bf7c55847691cba7f40084c69a3b16c808d52c33ae7e1f2aaae746",
     "sha256:28c30b7472927463bd459c926abeb07d11699bb6025e23f2a837c5122a21823e"
    ]
   },
   {
    "name": "sha256:9759e45e271ef502e2ed6f7e12dc2ecb10e39fc0cd22e195f7d47edec39ff0fd",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:9759e45e271ef502e2ed6f7e12dc2ecb10e39fc0cd22e195f7d47edec39ff0fd",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92491c8a90cf467336f6e7d283809c4de69e0141bdcf17c023b1edf310c8f678",
     "sha256:be2d37fed3de60e335e761ccc650ef174a17f8be5660b42bc5cc227b557aa13c",
     "sha256:59fa19b8a7c852313d6da30a39e527c63cb86d703a31f955d8b1d8d6c4d1928f",
     "sha256:d15d81c9adbc318984630896ccab62b8d2809b3ed4ccc24f9c1941db3fa7c18f"
    ]
   },
   {
    "name": "sha256:1bf1045a01f635107d56b8cb4cb9ee53edbe601ab2c2a2f2764cde32a8af6d07",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:1bf1045a01f635107d56b8cb4cb9ee53edbe601ab2c2a2f2764cde32a8af6d07",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:48ab3c8e50d20b459583e01f46d23c8425648e3625f5973e2ade51195fbec58a",
     "sha256:1c407a140f09910093079e804df0ec64cd5bd52aa5ad1b4e84676a5a3bbbdc86"
    ]
   },
   {
    "name": "sha256:af6d30759c2a1163149d04caf0392c783ac0f55f8dc5aa2a2e85b0d0ddbf5ffc",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:af6d30759c2a1163149d04caf0392c783ac0f55f8dc5aa2a2e85b0d0ddbf5ffc",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:2773d6386e4956d281b2e01005dd0004f7046b1bbe67f872276619ecd7b2cdd8",
     "sha256:a348a702b9307e0641711d86ce3efa7ac4c61fb342e5371ebace869daebaa6ea"
    ]
   },
   {
    "name": "sha256:decdc667829098ed2d677f0b429582d9957f8cce6477962ffd46e2d67cf66884",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:decdc667829098ed2d677f0b429582d9957f8cce6477962ffd46e2d67cf66884",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:3f8c7babd8aacf51d5e5ecf250cfc4c50cab9f0c7df0653d77b5c1484c1c319d",
     "sha256:94868538692ada32b0f4bc8456e8622c7c236f0e281789ebc09040885e40d003"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:40192e6b43abb91b01cfb12e9c6c2132b529c8a52b0ee0c4a4e5502337d1135e",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:40192e6b43abb91b01cfb12e9c6c2132b529c8a52b0ee0c4a4e5502337d1135e",
    "tagSymlink": "80e520fb",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:1bf1045a01f635107d56b8cb4cb9ee53edbe601ab2c2a2f2764cde32a8af6d07",
     "sha256:af6d30759c2a1163149d04caf0392c783ac0f55f8dc5aa2a2e85b0d0ddbf5ffc",
     "sha256:decdc667829098ed2d677f0b429582d9957f8cce6477962ffd46e2d67cf66884"
    ]
   },
   {
    "name": "sha256:91fea6092eaab3eae582c83e2b4a607d4ab57986e5545993483cf1cc077a2725",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:91fea6092eaab3eae582c83e2b4a607d4ab57986e5545993483cf1cc077a2725",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0a21bb5475ea5fbcfdeab2bbe08a1cf4ef0b55382d553d2c213620763078223c",
     "sha256:38dd71adcfc1f964c6f3ba6ae3b6daa95f612681cfb05298b225bb6347942f56",
     "sha256:408d72b5afe1db674fd2e4bd38c8ca7138ac3c5d1b523be9fe48fcc674660890",
     "sha256:f709798e835fb171af14a66fabad7821e61358c88a7681666a109a28ae97d88a",
     "sha256:6a8269417675d413d10593d4e58e9230e67d119fcc90dbdc95956206fd34cd38",
     "sha256:2c6dc0abaf54c0118c842fa0fa50498ecf4b2ce19e20a6300536cec8a8bd0ad1"
    ]
   },
   {
    "name": "sha256:2ed76c113d93e94cfd242b1b59f2fc5c6efa203687b6ff07dc1ebd7d77c3542c",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:2ed76c113d93e94cfd242b1b59f2fc5c6efa203687b6ff07dc1ebd7d77c3542c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3abc8c0d3d4265b5efb17447cd4a399fc70858b08d7cd5dce88dca7a09bc089",
     "sha256:ada7e11fb107d011a3b016cc659ca3f138f11725949328d92d3714ac15ef4ce2",
     "sha256:d84558a70da2c2b3d51676a2caeeee48c18fd37f2ba3e39fa42baf8ddfcb4742",
     "sha256:50ca6a96e05b73227186687cf370829661c75ac0a0c83b0cc7f4a762f0edec80",
     "sha256:b9e53a323da4866c05ba364aecc3e560e17c3998ec591667faac7c43477d5d60",
     "sha256:6b88b2ca0a430cbeb6274da9d26a8fc79c4c27f8298297a00483a6efa57df12f"
    ]
   },
   {
    "name": "sha256:ef95a9a7c27a7f35b44caf6270dc6fdea394732a3929c1f11525ab159fbae276",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:ef95a9a7c27a7f35b44caf6270dc6fdea394732a3929c1f11525ab159fbae276",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92559d5f5a908101d2776f8e756d73806b2bd3354be51e12d3111c90a4f09b07",
     "sha256:083e3eac55c875258c6477c979a400f62751e489a5aa9ffbbf0bf0bfdf773bcf",
     "sha256:71cf785318807dbca4c866feb2e756e67c6898947ac3ff0410374dac21595113",
     "sha256:599336d681de5f6758c6432ce16f750563ecbcd827af554aa926123cba489bfa",
     "sha256:c7f6b0ca7d55387a874c735018f1bb58d47fc714072a271ea481f04cf27496a7",
     "sha256:cbe31bb348b34a9857e7814df8a53557bdf8517f6bdbe8832123a9ec4a2e6b8b"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:c676426bfc0eeeace11aaeb46167e5a90f54be4c4320ffb2f5a71fde054dba54",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:c676426bfc0eeeace11aaeb46167e5a90f54be4c4320ffb2f5a71fde054dba54",
    "tagSymlink": "d1d9e249",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:91fea6092eaab3eae582c83e2b4a607d4ab57986e5545993483cf1cc077a2725",
     "sha256:2ed76c113d93e94cfd242b1b59f2fc5c6efa203687b6ff07dc1ebd7d77c3542c",
     "sha256:ef95a9a7c27a7f35b44caf6270dc6fdea394732a3929c1f11525ab159fbae276"
    ]
   },
   {
    "name": "sha256:4d863979f67280825c7a10cbcebc495972e3d0ac58f10f63987706d6f8c8f60f",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:4d863979f67280825c7a10cbcebc495972e3d0ac58f10f63987706d6f8c8f60f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
     "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
     "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
     "sha256:5440aed08ab7b424005a1a8f5b4a7231cb1160fe18b19f8ecabda37c5e5d7a50",
     "sha256:902dc0073b2a864e58986625bdcfa3cdb466a9a980909dae1e154c5ced3f8922"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:39431c0f4359b85b1a09bf239761672b906375a08163d3f98a5c30de2ea76a1f",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:39431c0f4359b85b1a09bf239761672b906375a08163d3f98a5c30de2ea76a1f",
    "tagSymlink": "e3091999",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:8fabff5be7802f8de5f1026893ae4f7bafb66a1e1f70df16c667e537ee0bedcd",
     "sha256:afb3f630b3215e327122688dc9edf0b651fda692c29a2b861df7357492f54702",
     "sha256:4d863979f67280825c7a10cbcebc495972e3d0ac58f10f63987706d6f8c8f60f"
    ]
   },
   {
    "name": "sha256:8fabff5be7802f8de5f1026893ae4f7bafb66a1e1f70df16c667e537ee0bedcd",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:8fabff5be7802f8de5f1026893ae4f7bafb66a1e1f70df16c667e537ee0bedcd",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
     "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
     "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
     "sha256:bce5136717acb536d29c841115a063a3de5343c0a512345746bab9d8891cd29b",
     "sha256:418a27e7118f6d840dc543cef588560cc4c6b2a8b4a19614b95211ae07706c7e"
    ]
   },
   {
    "name": "sha256:afb3f630b3215e327122688dc9edf0b651fda692c29a2b861df7357492f54702",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:afb3f630b3215e327122688dc9edf0b651fda692c29a2b861df7357492f54702",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
     "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
     "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
     "sha256:c42912b5ec04d6e7aa99f0a0a2d2c3c312b4df50651b6953ac1c5dce374477c2",
     "sha256:cee83529a608e71515751123732f36b1fe357029c864259bb0ae080aa20bc6ae"
    ]
   },
   {
    "name": "sha256:594ed3b3ba781e14e41d2cf280b6e750577c1fb3a2e8705d075d6e42a0d62aa6",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:594ed3b3ba781e14e41d2cf280b6e750577c1fb3a2e8705d075d6e42a0d62aa6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
     "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
     "sha256:0da8ea96811e3af7a02a4b94a8a97a964fdcad70a1f14455a969bd1a41e298f3",
     "sha256:92d92026317ab223f447875a41716b4dd3821e42c67a2c044577f10bdcc52307"
    ]
   },
   {
    "name": "sha256:35af8575a35635d3414d8867cdca36c9edd60e7ac5e62ac107401e5832521736",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:35af8575a35635d3414d8867cdca36c9edd60e7ac5e62ac107401e5832521736",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
     "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
     "sha256:77c49897e876b9f52c471a5e2e6db4648846ca6fda2f51d9bd03662517522e88",
     "sha256:2193b2133dbf69a40e12cf1fef6bd61807e09051ee18412451aed5e5931dee5c"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-snapshotter@sha256:cb781aff7b4ead2e0535274186b5e97274d734e19e9ef404e187bc39d11bb2cc",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:cb781aff7b4ead2e0535274186b5e97274d734e19e9ef404e187bc39d11bb2cc",
    "tagSymlink": "dda988d8",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:57433dbdadcd05b83c67b11f2f841a0cb6ee946a76c8d31c0c20366913ceb13c",
     "sha256:3e03fde9edf45d02e3b3bd4174624e6c5cac906164c9b4a71326cb48c6b417b6",
     "sha256:594ed3b3ba781e14e41d2cf280b6e750577c1fb3a2e8705d075d6e42a0d62aa6",
     "sha256:35af8575a35635d3414d8867cdca36c9edd60e7ac5e62ac107401e5832521736"
    ]
   },
   {
    "name": "sha256:57433dbdadcd05b83c67b11f2f841a0cb6ee946a76c8d31c0c20366913ceb13c",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:57433dbdadcd05b83c67b11f2f841a0cb6ee946a76c8d31c0c20366913ceb13c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
     "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
     "sha256:537923d8664825e1717cb0aef4a874b18949378bcb049a0616f534a136f3d134",
     "sha256:322793899b82cedef9e0c449b5ad00edb965245e132c68ce5cdecfa8697d2aad"
    ]
   },
   {
    "name": "sha256:3e03fde9edf45d02e3b3bd4174624e6c5cac906164c9b4a71326cb48c6b417b6",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:3e03fde9edf45d02e3b3bd4174624e6c5cac906164c9b4a71326cb48c6b417b6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
     "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
     "sha256:ccbd47ddd88ffae841c82627948300d6481bdfb9d7b3f8c321c19c9b1c942ae3",
     "sha256:69440cfd5e902e3ad95bdf462ecf6576bd1e48daac9532bf2ef3f4b5abfeb4de"
    ]
   },
   {
    "name": "sha256:46a42ee35b022e514ca90a658216ab1875d364cfefab477c36701ec5e6695b8c",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:46a42ee35b022e514ca90a658216ab1875d364cfefab477c36701ec5e6695b8c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
     "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
     "sha256:550324c9b0b4b0a46b91e9089663864ecaf21be53f8a655ce22c42baedec4b45",
     "sha256:64c38c3cb4aabfef0d8c1ad437ee6393a3717234840863415ba823d35f481030"
    ]
   },
   {
    "name": "sha256:7d2f4e2249d1710dd89af2f6e9691bcf352998d97a08145ecbd16e994e623b0e",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:7d2f4e2249d1710dd89af2f6e9691bcf352998d97a08145ecbd16e994e623b0e",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
     "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
     "sha256:e29974a13056c7a26f9b9bd54deb4a78bda7a7ea27984d1de838905116565156",
     "sha256:13f6cf0475761fe9577a9c597d7bb93daf9224d95acf68513625062cb87497f4"
    ]
   },
   {
    "name": "sha256:abd620117a5743682ccc9e8e46046d8838a525fbb6527232cdede8d4d00360c8",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:abd620117a5743682ccc9e8e46046d8838a525fbb6527232cdede8d4d00360c8",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
     "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
     "sha256:ee634b1d79169672ad22cc0eee1ccee30253fdb7a2af4e329ccf2fa7c44c6697",
     "sha256:30b69b33a97523412505e971fc70af7da94ac3d9733d2523054bb066bea94094"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-snapshotter@sha256:84982def260a1f03a0299528182951993d5c105676c7dd7fe502d12fa167aaae",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:84982def260a1f03a0299528182951993d5c105676c7dd7fe502d12fa167aaae",
    "tagSymlink": "6e43226",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:84e5dec6cc27b7c738d2465e7e999d1af2012dd3f825be118b47dcb5dca37dc6",
     "sha256:46a42ee35b022e514ca90a658216ab1875d364cfefab477c36701ec5e6695b8c",
     "sha256:7d2f4e2249d1710dd89af2f6e9691bcf352998d97a08145ecbd16e994e623b0e",
     "sha256:abd620117a5743682ccc9e8e46046d8838a525fbb6527232cdede8d4d00360c8"
    ]
   },
   {
    "name": "sha256:84e5dec6cc27b7c738d2465e7e999d1af2012dd3f825be118b47dcb5dca37dc6",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:84e5dec6cc27b7c738d2465e7e999d1af2012dd3f825be118b47dcb5dca37dc6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
     "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
     "sha256:7dd41fb0b4e577cf7bac7926964cb047a679bd743be1e6b3d82a965920a955ef",
     "sha256:105500e29232139ff2d3d199cb3df133c21bb64e5bfd03392c995e1cf09cc710"
    ]
   },
   {
    "name": "sha256:73fac885482871f744fcf2e5635be1e10d812845ba122d30446641f11d436099",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:73fac885482871f744fcf2e5635be1e10d812845ba122d30446641f11d436099",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:510abfcdf6bce7517c9dbde8fd24c03d8f36fe1503f65a712f824401f857aac7",
     "sha256:4a3604715398d774a2abb75d31b035aa4099557f7016e27550cefc9759368cda",
     "sha256:43dcf74e6c1f183a4e79e837e8095c1e81efde28deeaaba85661cc0da98aedb8",
     "sha256:c1c028ae728e2527272dc959d0d9af41037826cf4017d383a1e8361b85614ccb"
    ]
   },
   {
    "name": "sha256:4ea80063a33a0524cffd54d2ee915332cd0bfafe8e448d1c283a9c80f46b8471",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:4ea80063a33a0524cffd54d2ee915332cd0bfafe8e448d1c283a9c80f46b8471",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f2cdfe33b637eca2019910dbfd9c00211fe1aeda61fe42b23f08bb74a91e72f5",
     "sha256:6d9e8294c3485a103e1bccd5ab429804c39e30fa9217e9b8e15154afe93e3167",
     "sha256:6cebe0c84c6f9b5e9e189708c95b9b1d05caa3e89c5dfc25285c04b8e85e7ad3",
     "sha256:cdeb7de8f0cb98f055bc50b8a880d3a64482905cb9a7424e8ae486611e66b6b2"
    ]
   },
   {
    "name": "sha256:c53e6cb927dc1d241f1466f3d11af80fe64a89a48c215e11c65cb04e08cf35fb",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:c53e6cb927dc1d241f1466f3d11af80fe64a89a48c215e11c65cb04e08cf35fb",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92491c8a90cf467336f6e7d283809c4de69e0141bdcf17c023b1edf310c8f678",
     "sha256:be2d37fed3de60e335e761ccc650ef174a17f8be5660b42bc5cc227b557aa13c",
     "sha256:7abf236008b38b739c5178765362c77c2427574653958b783256087e07e9b5e8",
     "sha256:7189446c989ba197b887fac29b598ed60c5fa98d36977ca0ed714d477efde643"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:4860ed22df4ac49573bcf2434266585ba48ff33c8f25ec2a36f616bd349c4e25",
    "path": "odf4/odf-rhel8-operator",
    "id": "sha256:4860ed22df4ac49573bcf2434266585ba48ff33c8f25ec2a36f616bd349c4e25",
    "tagSymlink": "295685fc",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:73fac885482871f744fcf2e5635be1e10d812845ba122d30446641f11d436099",
     "sha256:4ea80063a33a0524cffd54d2ee915332cd0bfafe8e448d1c283a9c80f46b8471",
     "sha256:c53e6cb927dc1d241f1466f3d11af80fe64a89a48c215e11c65cb04e08cf35fb"
    ]
   },
   {
    "name": "sha256:e8bf5c9a2d748f76ddeba0fad9b9d53cabefdcf6cc9abaa8131e66e2c10a12bf",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:e8bf5c9a2d748f76ddeba0fad9b9d53cabefdcf6cc9abaa8131e66e2c10a12bf",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
     "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
     "sha256:7c09aa258efa0f1afbf6e69a446dfdf38ea9cc55081e802030f94c394a456ade",
     "sha256:a374e1d02001ccae2586e0a7f745ca15055f16d4ba65e9f41fbd5c8c340b7692"
    ]
   },
   {
    "name": "sha256:c76c79c9582c3173fb03316d428a931dee0d5a0f170196379fd666398ef7995c",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:c76c79c9582c3173fb03316d428a931dee0d5a0f170196379fd666398ef7995c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
     "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
     "sha256:194efc41523556292bc2ccc99ca9c7fb848705b83945c05cdb67f1b185d239e5",
     "sha256:ab392a43178ddf39ee61be70a3ce0c5b4b6e054fcc4bc1beee52d1cacdb32c2f"
    ]
   },
   {
    "name": "sha256:2eec86a7b47ba1c2b6bec53bd1099cff94530d32679b3447219da0162c8b8b1f",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:2eec86a7b47ba1c2b6bec53bd1099cff94530d32679b3447219da0162c8b8b1f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
     "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
     "sha256:df875a25b7f1f2107b18fbb11d8b840d31ef48c29b86e82e44005ad2bf361b8a",
     "sha256:dcf52c62d6f601a1fb53d18c096eef9b4e983afa417c33756d4008b9a670b72c"
    ]
   },
   {
    "name": "sha256:ddf26e62df798ba3558fcda98c4f9cc7f1e3b9fd59f7cd2125cecb6464afb2a2",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:ddf26e62df798ba3558fcda98c4f9cc7f1e3b9fd59f7cd2125cecb6464afb2a2",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
     "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
     "sha256:04f7ea855908912d274c9da3aa2c85c794706372657e153bb0e54a58de5e8198",
     "sha256:e00a6f014aa8048d92713b5af401ca6a38ebe9714d00d0ea5866c1cac092f407"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-snapshotter@sha256:af51ccc5af0c59d3795f1872104a441edd79c2de93038076c697b35ec189bffb",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:af51ccc5af0c59d3795f1872104a441edd79c2de93038076c697b35ec189bffb",
    "tagSymlink": "20c01092",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:e8bf5c9a2d748f76ddeba0fad9b9d53cabefdcf6cc9abaa8131e66e2c10a12bf",
     "sha256:c76c79c9582c3173fb03316d428a931dee0d5a0f170196379fd666398ef7995c",
     "sha256:2eec86a7b47ba1c2b6bec53bd1099cff94530d32679b3447219da0162c8b8b1f",
     "sha256:ddf26e62df798ba3558fcda98c4f9cc7f1e3b9fd59f7cd2125cecb6464afb2a2"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:bc2cac50a38866218646cb8b9af10cc8fa03cb01467878ebf412e783150350ea",
    "path": "odf4/odf-operator-bundle",
    "id": "sha256:bc2cac50a38866218646cb8b9af10cc8fa03cb01467878ebf412e783150350ea",
    "tagSymlink": "b4b16a7a",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:75719a72b1f2b33be1841ec0220c3ffec3bbbf23d5faf2d3c2369a3d73bf2643",
     "sha256:9c56b3e6b0c37fa3f823e8877e08e23a895f2b64644af1b704af30555192789e"
    ]
   },
   {
    "name": "sha256:eee49735c571235e3ae31a744ca42b6be77ac6bd32e215a5fd9dbadaba1655d6",
    "path": "openshift4/ose-local-storage-diskmaker",
    "id": "sha256:eee49735c571235e3ae31a744ca42b6be77ac6bd32e215a5fd9dbadaba1655d6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
     "sha256:b56af1360c83e0a0479bf161b3ec392c8c513f8e8104700c8ed696fe4b261c8d",
     "sha256:e3e58850242aeb7a5ea292ad8cc81e9b93348c377166e02c6689f022d8400be4",
     "sha256:3ddd737cfd1c65622914f24fab3339e8fc27f7c8399820a551df2f05e6215613"
    ]
   },
   {
    "name": "sha256:95990a16ba9b1d2796f82c5939c7d19446bf87e5b21c42a2726eaa628c9b77ea",
    "path": "openshift4/ose-local-storage-diskmaker",
    "id": "sha256:95990a16ba9b1d2796f82c5939c7d19446bf87e5b21c42a2726eaa628c9b77ea",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
     "sha256:74f1fb7a06eab765809ca437e035b054dcfb1e6ecb3158ecc8a9076b6f26210f",
     "sha256:4d958a5050d6726390d3848aee85bdbc448933f51e227a98e5d9775a0f32c731",
     "sha256:a49aaacf7765e8104bbe9a0bcefe4816f401a96ee6be8284106714bf56bed7e0"
    ]
   },
   {
    "name": "sha256:9ad61e2534e0818536a0ef01cb465c4de13e6c7c4ca255177d8c992eaf7368e7",
    "path": "openshift4/ose-local-storage-diskmaker",
    "id": "sha256:9ad61e2534e0818536a0ef01cb465c4de13e6c7c4ca255177d8c992eaf7368e7",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
     "sha256:9510f581bc6968bd3717fd248986be74458e606ee275a794d769df8d1e544640",
     "sha256:a510116adb4843247d09da971967c7c2c7433f28a00b20adb28500f7e731a755",
     "sha256:c726bf573935bf1ee43604c6f8e0565ab13522ed6b9a7d2bdde7f551b1f7d26b"
    ]
   },
   {
    "name": "sha256:6c4804ad646cf7ab338a5bf689819ab811f59b909479a73a7bf0dc4ca64dda10",
    "path": "openshift4/ose-local-storage-diskmaker",
    "id": "sha256:6c4804ad646cf7ab338a5bf689819ab811f59b909479a73a7bf0dc4ca64dda10",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
     "sha256:39504606388e1d44d94d8a1b2d37e37c80a5453590aaa0ec5b1c8b510a77750f",
     "sha256:71a31f5f3ddd970d2cb95f9a66c68767f1f6a019bf2eafe9be7ed19844282d89",
     "sha256:eea541bd457e0ae997a5de9258edef09013726fbbf1415879005ceb7c318823a"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-local-storage-diskmaker@sha256:59c007844374c698e948abbfebc47e42b6a40ed3d6065d78c28e677587f9a780",
    "path": "openshift4/ose-local-storage-diskmaker",
    "id": "sha256:59c007844374c698e948abbfebc47e42b6a40ed3d6065d78c28e677587f9a780",
    "tagSymlink": "3181674b",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:eee49735c571235e3ae31a744ca42b6be77ac6bd32e215a5fd9dbadaba1655d6",
     "sha256:95990a16ba9b1d2796f82c5939c7d19446bf87e5b21c42a2726eaa628c9b77ea",
     "sha256:9ad61e2534e0818536a0ef01cb465c4de13e6c7c4ca255177d8c992eaf7368e7",
     "sha256:6c4804ad646cf7ab338a5bf689819ab811f59b909479a73a7bf0dc4ca64dda10"
    ]
   },
   {
    "name": "sha256:adc5da00f5feb6bc3a717ca7c1f10c2fe95e6dbf96819aa3931aabc317aade1b",
    "path": "openshift4/metallb-rhel8",
    "id": "sha256:adc5da00f5feb6bc3a717ca7c1f10c2fe95e6dbf96819aa3931aabc317aade1b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
     "sha256:76abd05e8d7b07d598d3ad8226f5618a3f6e870b7407d3ce1a8198e1374f09c3",
     "sha256:dac69fc3485eb7e4fb16b0721586934c17e53a4bdec8792e3d30096cbb639395"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/metallb-rhel8@sha256:90d2a8e89c878e242f87eaa68e73c63204c431127d33c813191ea5def8c598f5",
    "path": "openshift4/metallb-rhel8",
    "id": "sha256:90d2a8e89c878e242f87eaa68e73c63204c431127d33c813191ea5def8c598f5",
    "tagSymlink": "770d9131",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:35f3c4a2305acea0d9b6ea497ac2698090520e4bd29f8fa663b70046e502f8d6",
     "sha256:1978f5234e4b123a09e4488ea466c2b9ec94131615873e592216d4915d52616f",
     "sha256:ff2cffcd8ca137db7aa2316940ad4bd7be687543fd045dca50512663caf61859",
     "sha256:adc5da00f5feb6bc3a717ca7c1f10c2fe95e6dbf96819aa3931aabc317aade1b"
    ]
   },
   {
    "name": "sha256:35f3c4a2305acea0d9b6ea497ac2698090520e4bd29f8fa663b70046e502f8d6",
    "path": "openshift4/metallb-rhel8",
    "id": "sha256:35f3c4a2305acea0d9b6ea497ac2698090520e4bd29f8fa663b70046e502f8d6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
     "sha256:850205e7bdb1dda587358268790dc316806dd767f7c26e2962d6cebd4ae6ed35",
     "sha256:5706327089a140a443cecc0e0dcf70527f35f77ef9eb3c2842f83f608e7e4d68"
    ]
   },
   {
    "name": "sha256:1978f5234e4b123a09e4488ea466c2b9ec94131615873e592216d4915d52616f",
    "path": "openshift4/metallb-rhel8",
    "id": "sha256:1978f5234e4b123a09e4488ea466c2b9ec94131615873e592216d4915d52616f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
     "sha256:2c0e8d86a294d29b355a5883c8f65896c5a1545cdd76c11db31ce6c0034bdcaf",
     "sha256:eb3597d533992eff9f4e4797e6e298814d23e8206c6da84ee90729815a83c4fd"
    ]
   },
   {
    "name": "sha256:ff2cffcd8ca137db7aa2316940ad4bd7be687543fd045dca50512663caf61859",
    "path": "openshift4/metallb-rhel8",
    "id": "sha256:ff2cffcd8ca137db7aa2316940ad4bd7be687543fd045dca50512663caf61859",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
     "sha256:d636ed61a8dffb303b46406e1a7d4ce090fd432f5a6d04db65316cadf56f1c9b",
     "sha256:d51f7d7a963be9db19ea223e9ab39a38be56e45af92b35664095905cb1ff76aa"
    ]
   },
   {
    "name": "sha256:1d01b70ebff07f3f3a66c997aae70325b0c240fe746e89973921e1cf7281a75b",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:1d01b70ebff07f3f3a66c997aae70325b0c240fe746e89973921e1cf7281a75b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:3296b73933545921c304eff356cace1fe59d9747470e8402dfffcc750a317551",
     "sha256:ac00ba95b735fa878b778cb49e9ff442ebdab61acc286a49d21c775a27055e2b"
    ]
   },
   {
    "name": "sha256:64a528108bca1701e77447ba87a344ada2d123ce980efc005e14abf8cd1d45a5",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:64a528108bca1701e77447ba87a344ada2d123ce980efc005e14abf8cd1d45a5",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:34a03469e7d1781c8ba532ae7a08fb76013ae7fbc6bec3253f4be449bb146885",
     "sha256:50985620b00e58c51ceba25a4bba7b6bbc96fa9026863d224b2a7de826ae0afe"
    ]
   },
   {
    "name": "sha256:c82f5eacb44a753cfcc0752660133a892f5123bf6dd75b2c87ce14f7fe7f32bf",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:c82f5eacb44a753cfcc0752660133a892f5123bf6dd75b2c87ce14f7fe7f32bf",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:e798dceb7ccc4ed400f18a61df47f9d7d224f1b0ba77fc7f7ac5d531a3c2eda1",
     "sha256:e53271995c2f16458d4eed9133d418c0a0eca4db0db3e012dc9f698a1d3d1253"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:ac97b59f8f5aa7e10730c0b43c8d94ebf344bb65b5f04ef864b3155fde11edf9",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:ac97b59f8f5aa7e10730c0b43c8d94ebf344bb65b5f04ef864b3155fde11edf9",
    "tagSymlink": "b82e370",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:1d01b70ebff07f3f3a66c997aae70325b0c240fe746e89973921e1cf7281a75b",
     "sha256:64a528108bca1701e77447ba87a344ada2d123ce980efc005e14abf8cd1d45a5",
     "sha256:c82f5eacb44a753cfcc0752660133a892f5123bf6dd75b2c87ce14f7fe7f32bf"
    ]
   },
   {
    "name": "sha256:c160a382ef65dddb7e2e0776e43893554fc7d3522786a59640642e82091194c3",
    "path": "openshift4/ose-local-storage-operator",
    "id": "sha256:c160a382ef65dddb7e2e0776e43893554fc7d3522786a59640642e82091194c3",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
     "sha256:b56af1360c83e0a0479bf161b3ec392c8c513f8e8104700c8ed696fe4b261c8d",
     "sha256:0afa4339d0d778869bcd926ca5991081026a17ab7084316c1259be80cc02c056",
     "sha256:1e80b8df630e74c8144c56a29443f59a5b3f66e9d1c32e2f6a6ff401bad945e3"
    ]
   },
   {
    "name": "sha256:806e00ea5b6890eab65ea5baab7bc64ef0431d8c6f1b28535af8b6404fe0d53a",
    "path": "openshift4/ose-local-storage-operator",
    "id": "sha256:806e00ea5b6890eab65ea5baab7bc64ef0431d8c6f1b28535af8b6404fe0d53a",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
     "sha256:74f1fb7a06eab765809ca437e035b054dcfb1e6ecb3158ecc8a9076b6f26210f",
     "sha256:3b2af82f9a2465d6df678ac59f38b86933f9aeacfd702228ad9e15f3a0dcec56",
     "sha256:8b488ead50c6cea7fcdb5a4bbb20acd2a9fb3c5e3072c7da06f0435411a136f2"
    ]
   },
   {
    "name": "sha256:80eae6a007faf45c5fa7150dd7dbd7b1b9b2e3b4dd69ccece725a405612a4f49",
    "path": "openshift4/ose-local-storage-operator",
    "id": "sha256:80eae6a007faf45c5fa7150dd7dbd7b1b9b2e3b4dd69ccece725a405612a4f49",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
     "sha256:9510f581bc6968bd3717fd248986be74458e606ee275a794d769df8d1e544640",
     "sha256:9793d8d74c1da1aafbe78bd188429786077c545daf12c140dc0ecd8c54abad0d",
     "sha256:0f1e8a759bc3b1f1c29c3c26fbfd5a6df14a6a21d5742ce790433f6572b3b581"
    ]
   },
   {
    "name": "sha256:8b92fc40d0cf1bdc724405cf59506594b372bc581522f182f003837f00944822",
    "path": "openshift4/ose-local-storage-operator",
    "id": "sha256:8b92fc40d0cf1bdc724405cf59506594b372bc581522f182f003837f00944822",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
     "sha256:39504606388e1d44d94d8a1b2d37e37c80a5453590aaa0ec5b1c8b510a77750f",
     "sha256:fc1398c595b1941a8f4f27bd9a3bee7c14a5a4c0d4bb8363f8830e65aa683823",
     "sha256:dce84c3836d8694a5c495a4d968bb4607a7b2aafb88edd3f9cc8ab51f0b85c27"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-local-storage-operator@sha256:0749bc8c664e19a530ff2b006ffba1d14143a8bab905900e62b0a0d4b3733e91",
    "path": "openshift4/ose-local-storage-operator",
    "id": "sha256:0749bc8c664e19a530ff2b006ffba1d14143a8bab905900e62b0a0d4b3733e91",
    "tagSymlink": "e70aa966",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:c160a382ef65dddb7e2e0776e43893554fc7d3522786a59640642e82091194c3",
     "sha256:806e00ea5b6890eab65ea5baab7bc64ef0431d8c6f1b28535af8b6404fe0d53a",
     "sha256:80eae6a007faf45c5fa7150dd7dbd7b1b9b2e3b4dd69ccece725a405612a4f49",
     "sha256:8b92fc40d0cf1bdc724405cf59506594b372bc581522f182f003837f00944822"
    ]
   },
   {
    "name": "sha256:00508ea6e2c614cac6eb66893612f5f0961e3c329ef619ba7da844f04c20f376",
    "path": "rhel8/postgresql-12",
    "id": "sha256:00508ea6e2c614cac6eb66893612f5f0961e3c329ef619ba7da844f04c20f376",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:0c1fd83997e17b079085107d40f89cea2211f9ec3db88d5241019a85d06db5a7",
     "sha256:12bdc7db0443e8648516eddbfe0e15a24b4dc781bcf18620b4c9d1cca2c5407e",
     "sha256:ecf502c449196b5ac76f8ecdd27d81ba9fa67fba16cd3cc8ab1e14124a3cba77"
    ]
   },
   {
    "name": "sha256:50273c7b11d2d9bdd25b1b3a539420344919fde5fc1c6be137639b4920c00b4f",
    "path": "rhel8/postgresql-12",
    "id": "sha256:50273c7b11d2d9bdd25b1b3a539420344919fde5fc1c6be137639b4920c00b4f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0f6e46285dbeaad8b2b8f01b5fe21771fc2b522ceafaf88d8f51ff88b51d87a9",
     "sha256:b88304ccd20b48c3e167431fdaa53db68d449caf91511ca66a32b356f947b6ea",
     "sha256:65eddd4ebf48afabea25643c1557f7181013847b5a4f98063a03489130b65755",
     "sha256:5db2c5a8d728886088d558c377825e41ba67c08c1ac75d62771d616b0a93ae68",
     "sha256:bfe30eebb0fd23d95d8ae44d7f14a13fb9267e180a3b36363350330d7269d3d3"
    ]
   },
   {
    "name": "sha256:c3a512657f8194675992388a521b16bca9eeb6be0fad96a06522dda208415663",
    "path": "rhel8/postgresql-12",
    "id": "sha256:c3a512657f8194675992388a521b16bca9eeb6be0fad96a06522dda208415663",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:d2be686e74da7c701311c471acf80b269afb9a3165314de5aa2b9a6df6562fd7",
     "sha256:3b00a282b422a128c038b6edcded4919fb981eee39a10b119e56736e439aa3b5",
     "sha256:9f7ab4e60e6a1d63db4432620a66351874eab776df535e9d7d97b99cd40217f1"
    ]
   },
   {
    "name": "sha256:fc3fb6c8321e7d40e17304ebc0434ccf476197c0e389142853503939493a52ae",
    "path": "rhel8/postgresql-12",
    "id": "sha256:fc3fb6c8321e7d40e17304ebc0434ccf476197c0e389142853503939493a52ae",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:da6cf90000f1e8c68029513a3674919c4c460ed472ba88ccbaa046c74ddcc951",
     "sha256:de7ee2617b8a6627a55d3428614b8271e3ab61b790ef9405dcd072ea715793a6",
     "sha256:701a293416f0661fa32724dd9542418ed19f6b6817aab5963c95052b48e2a509"
    ]
   },
   {
    "name": "registry.redhat.io/rhel8/postgresql-12@sha256:fa920188f567e51d75aacd723f0964026e42ac060fed392036e8d4b3c7a8129f",
    "path": "rhel8/postgresql-12",
    "id": "sha256:fa920188f567e51d75aacd723f0964026e42ac060fed392036e8d4b3c7a8129f",
    "tagSymlink": "7a9d35ac",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:00508ea6e2c614cac6eb66893612f5f0961e3c329ef619ba7da844f04c20f376",
     "sha256:50273c7b11d2d9bdd25b1b3a539420344919fde5fc1c6be137639b4920c00b4f",
     "sha256:c3a512657f8194675992388a521b16bca9eeb6be0fad96a06522dda208415663",
     "sha256:fc3fb6c8321e7d40e17304ebc0434ccf476197c0e389142853503939493a52ae"
    ]
   },
   {
    "name": "sha256:4e3c86fd37ca3982998087b1572a281fd65a92a76f499b60c02a9471206b2daf",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:4e3c86fd37ca3982998087b1572a281fd65a92a76f499b60c02a9471206b2daf",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
     "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
     "sha256:a626aa3e9c312a3b9ff16868d760c1d055cf37e4354a9c711a846e7dd22fa83d",
     "sha256:8b57b0f969f56d584801898567a23d75dbb79a7d90c92beb5b9b29ab89604ef1"
    ]
   },
   {
    "name": "sha256:7126555f8bcb85017ed64669ddc5efc6bd9347f41195fdb073f5bd04153dce71",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:7126555f8bcb85017ed64669ddc5efc6bd9347f41195fdb073f5bd04153dce71",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
     "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
     "sha256:7f6121bb2c022862c0b05041e8298555ca7eba0b318c0183b90c3b6225d123de",
     "sha256:9fa3d4c221dbddc018db69c0ac7f696ef5d61d4417cf81ca61d7abc73b642665"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-provisioner@sha256:95010584242f9705ffad17632bd11cf1299955b986d1e5b4b8892f9fda75bb00",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:95010584242f9705ffad17632bd11cf1299955b986d1e5b4b8892f9fda75bb00",
    "tagSymlink": "5212fcb6",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:060ded5b7815eb6ac09668db63940152eb4c39ecfa618626ec48c544b09f522a",
     "sha256:f1ceb53b087629a6c76e9c76ab54b79edd0b12d036e0d3f72ba59b193cdd48cd",
     "sha256:4e3c86fd37ca3982998087b1572a281fd65a92a76f499b60c02a9471206b2daf",
     "sha256:7126555f8bcb85017ed64669ddc5efc6bd9347f41195fdb073f5bd04153dce71"
    ]
   },
   {
    "name": "sha256:060ded5b7815eb6ac09668db63940152eb4c39ecfa618626ec48c544b09f522a",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:060ded5b7815eb6ac09668db63940152eb4c39ecfa618626ec48c544b09f522a",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
     "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
     "sha256:523d8b62e30259efc379b2c40d2df107709a99f07a97c1f3ebc85abc96c92242",
     "sha256:1ec191b35daa7695469cf903435977735acbcd252c6125afa2facc462e79a368"
    ]
   },
   {
    "name": "sha256:f1ceb53b087629a6c76e9c76ab54b79edd0b12d036e0d3f72ba59b193cdd48cd",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:f1ceb53b087629a6c76e9c76ab54b79edd0b12d036e0d3f72ba59b193cdd48cd",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
     "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
     "sha256:1e4833636725ad03833bc18c35dfbf7ef57c9d3f94b94cdab0aee68a6d25723d",
     "sha256:953608ca8bb7e08d2fe0a6ca28be6f0d93ce4d2eaec42bb8cfdc2410e66f30ef"
    ]
   },
   {
    "name": "sha256:bc6c190459f11fe66de8a36d21b950e240e3f074edd1f1bc2b12c0fd2c2d0867",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:bc6c190459f11fe66de8a36d21b950e240e3f074edd1f1bc2b12c0fd2c2d0867",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d3b9a4a690bf1791b874c3495c6a8e2c039150b5882374cd9c42dd4bba68ba31",
     "sha256:a049ed70eeb87542c711449e14b6a7ccdde9ca2219d749fa0872aa755f2a89cb",
     "sha256:e60835077d2634006c80c65eb8c91a891fd0ba325ad9d512792f25579b8f5f9f",
     "sha256:b944243f8e37505bd9d6ba730425b66ccf8951a684364318ff324a15ceb606a7"
    ]
   },
   {
    "name": "sha256:a4e20b4042cbc2c0eeeb802c4afdd89955cdc36109357dd8339ffb55565fd893",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:a4e20b4042cbc2c0eeeb802c4afdd89955cdc36109357dd8339ffb55565fd893",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:02863a09124c1837ee0672a011fb7e2d5c95ae16af6b569f65d2e0f763127ddc",
     "sha256:97aead8e17dadf7e07e5153ee6d5a68d28e46847e01db6d9325742076043fd20",
     "sha256:2adb09105a7be697913af3405b729f187eb0c5ad85cf44042388b240cfdab07c",
     "sha256:e9b026ac67129a48423433350ec0cbe66ca75267785ad722b0a6e404c09d2cb9"
    ]
   },
   {
    "name": "sha256:25029b77d58b4b953a80c083dae16de2a444ea7d0acb76ca362a1a70cc5dc9f1",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:25029b77d58b4b953a80c083dae16de2a444ea7d0acb76ca362a1a70cc5dc9f1",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:220d447748c8866cbfeac8fb3534dd8d49cc8b99cc625041414c17d0f80e02ca",
     "sha256:8909629d32e7d0fef085a5fcee0e0f318367006d81be0d5da8e0a209ee230793",
     "sha256:630667c86246798272e16bf55d043b4f2f7b85115322e4388607c4bd5c6fd9f8",
     "sha256:35b03c6be04735bf69759b256843e402abd39b04359d491cd045cce30d637d45"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:a295b5db13342aa596d8936615b80df86259a0658a4190bd66453df1db450cae",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:a295b5db13342aa596d8936615b80df86259a0658a4190bd66453df1db450cae",
    "tagSymlink": "a7efffb",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:bc6c190459f11fe66de8a36d21b950e240e3f074edd1f1bc2b12c0fd2c2d0867",
     "sha256:a4e20b4042cbc2c0eeeb802c4afdd89955cdc36109357dd8339ffb55565fd893",
     "sha256:25029b77d58b4b953a80c083dae16de2a444ea7d0acb76ca362a1a70cc5dc9f1"
    ]
   },
   {
    "name": "sha256:799238f3a3e8c653a9305a94a9e24331270788a46e0df482184743085ccdb11b",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:799238f3a3e8c653a9305a94a9e24331270788a46e0df482184743085ccdb11b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
     "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
     "sha256:efb5226a8d51179e2da89a5606a2bc528a5f1ece0da7199aff54c86ab80c165f",
     "sha256:440c30e59dcc79db2a22b06fe0d45bfac21b9eeb1d8ad489d83b9c78a32570ab"
    ]
   },
   {
    "name": "sha256:9711b01a0db1c6c49600898edadecb9770fdff86c7b7a61515e171d865d003bb",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:9711b01a0db1c6c49600898edadecb9770fdff86c7b7a61515e171d865d003bb",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
     "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
     "sha256:63ca0a8608ec267f814944bf017b68d90710a531d3983a38e9e407f5e0ee9934",
     "sha256:1d38b666dcfff5507e494897d9dc20bc0c655a23ef1ba65674ded6c616f85ae9"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-attacher@sha256:9f6674a2dfc651e47bd9b9cbea8368324e6c2404f4478538f29c3d67b41892bd",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:9f6674a2dfc651e47bd9b9cbea8368324e6c2404f4478538f29c3d67b41892bd",
    "tagSymlink": "f87f7249",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:44362c107867bf45198f21bf493714c38a00abbbde2393cf043613b3443eb9b1",
     "sha256:f287dc254638e35115aa94c9c7d48837136f2c559b7997885de3400803eead68",
     "sha256:799238f3a3e8c653a9305a94a9e24331270788a46e0df482184743085ccdb11b",
     "sha256:9711b01a0db1c6c49600898edadecb9770fdff86c7b7a61515e171d865d003bb"
    ]
   },
   {
    "name": "sha256:44362c107867bf45198f21bf493714c38a00abbbde2393cf043613b3443eb9b1",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:44362c107867bf45198f21bf493714c38a00abbbde2393cf043613b3443eb9b1",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
     "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
     "sha256:19561cd47cd8a9dd77b40268cf73a29a3e0f73af61548b645c79d68aba3f5554",
     "sha256:b1de854749771ab55bd288e47fe0b502d5612de0dbe7ffd6bc2791ab69781162"
    ]
   },
   {
    "name": "sha256:f287dc254638e35115aa94c9c7d48837136f2c559b7997885de3400803eead68",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:f287dc254638e35115aa94c9c7d48837136f2c559b7997885de3400803eead68",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
     "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
     "sha256:b33456a99b9264b0bbad795e22f26a8dcba748e96627c66d7510ce744b9e9498",
     "sha256:ed151c224b571fa64aeae6e1932168621d61547ac36be23bb1c16b741ba2df3a"
    ]
   },
   {
    "name": "sha256:49c29686dd52cb83bef501080a5f4a3aca083f39779b6edde5fc904c1ddbeeab",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:49c29686dd52cb83bef501080a5f4a3aca083f39779b6edde5fc904c1ddbeeab",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:1b890c73c3cf60b04334fded9e3edc647d64dd39ffd078317e2bd69552a2fd1d",
     "sha256:de63ba066b7c0c23e2434efebcda7800d50d60f33803af9c500f75a69fb76ffa",
     "sha256:b2a723a1165850255e84a64214f06e6adb9ff3f3290e0b35132313684af7b621",
     "sha256:927e99d68d749f9e40b07e4cfb68839ff8d3124c7464a2fe860c254142d66208",
     "sha256:c02ba9b8068d37b6b9b6db8d1883238f3ee8b0bf87a0ac271d0963b65edd33dd"
    ]
   },
   {
    "name": "sha256:d66256c5556046c1c13305032135cb557ba6f583bbffe4ee5abb8cea768b2ec2",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:d66256c5556046c1c13305032135cb557ba6f583bbffe4ee5abb8cea768b2ec2",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:9f78280d50082c329e73123d73b3debc7f5eec007d8a0c7b1d388ff69b9652fc",
     "sha256:a1a64b9c0d1a2a468c65bf81fb26d51416a3e19d95d08df39e5d7d012a25b685",
     "sha256:f7109c3dbacb07ae738be8afb80c1d580757c61c03ec5e18ef2fa600b7823d26",
     "sha256:40ebdf21c7df4bc66e2fa9aff0f89bcd301f0d7187a9002c2fabfd2b08d4b936",
     "sha256:2d2ba384b765dbbb0756687e5aa24db4c4c5e842db4c9d8098f5a09a605d2d79"
    ]
   },
   {
    "name": "sha256:484cc3f968a76c3cb876ceb530317c11dc93048c6ba4f1f5ae1d088131ed7cfd",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:484cc3f968a76c3cb876ceb530317c11dc93048c6ba4f1f5ae1d088131ed7cfd",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4f639942cb5a04cfde9e90ad4590927d87ec970f46186ebe46182c2f0657584d",
     "sha256:261c17695cc21090e4719a05e282f024f0ab9a36997b3e3550ee7a97dee98668",
     "sha256:aa345f2f6695ebc5e00997e8487c157fd9669cc8cfcb7dfabe3b00bb7ae5a4f4",
     "sha256:4d3642dc61ab84d825e0dc1a106398683a20f88f109ed1268a3df1254481c4db",
     "sha256:acd5b99027dfc7b89405d61ea8942495603aed0a3985b8a51377e900b73255af"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:dfe11ebccdc711a0b303d78c93998dac5fa41e8946beb7536b8a5e42c6d9ad05",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:dfe11ebccdc711a0b303d78c93998dac5fa41e8946beb7536b8a5e42c6d9ad05",
    "tagSymlink": "607290c",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:49c29686dd52cb83bef501080a5f4a3aca083f39779b6edde5fc904c1ddbeeab",
     "sha256:d66256c5556046c1c13305032135cb557ba6f583bbffe4ee5abb8cea768b2ec2",
     "sha256:484cc3f968a76c3cb876ceb530317c11dc93048c6ba4f1f5ae1d088131ed7cfd"
    ]
   },
   {
    "name": "sha256:ad89936da3510643ac92087fedfc71965cb4b1e2e1845162f6e04eeb02b5f857",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:ad89936da3510643ac92087fedfc71965cb4b1e2e1845162f6e04eeb02b5f857",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:510abfcdf6bce7517c9dbde8fd24c03d8f36fe1503f65a712f824401f857aac7",
     "sha256:4a3604715398d774a2abb75d31b035aa4099557f7016e27550cefc9759368cda",
     "sha256:dd957fcf0d58b6f221628fb5be23bb1b5816457a6094ef53927b10dce2e5fd38",
     "sha256:541c8159e97693673066cea66982536e861c65b4945ffbdab95ee7dbd16dcc45"
    ]
   },
   {
    "name": "sha256:3808e1084febf2ee4d32e2ae6334c4feb17c1ac57df3c30d514227514cbd4a2c",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:3808e1084febf2ee4d32e2ae6334c4feb17c1ac57df3c30d514227514cbd4a2c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f2cdfe33b637eca2019910dbfd9c00211fe1aeda61fe42b23f08bb74a91e72f5",
     "sha256:6d9e8294c3485a103e1bccd5ab429804c39e30fa9217e9b8e15154afe93e3167",
     "sha256:35a867e085375220d3ac53a71ee97a7f5337b3ab540cb57cc18d1a0289c6d9d5",
     "sha256:65c5495a2f8ea74c0589a188fe322f292f697af1723ad8f360125c757aefda0a"
    ]
   },
   {
    "name": "sha256:60133217c4f4d5cc1e778e92f7de31a527ff43846aaebe5db6dd5d9978d7c2fb",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:60133217c4f4d5cc1e778e92f7de31a527ff43846aaebe5db6dd5d9978d7c2fb",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92491c8a90cf467336f6e7d283809c4de69e0141bdcf17c023b1edf310c8f678",
     "sha256:be2d37fed3de60e335e761ccc650ef174a17f8be5660b42bc5cc227b557aa13c",
     "sha256:20d7418ab044bdb92959e004b595d8d867843bcc2ea72c0f8ee9a44aac0372b5",
     "sha256:d15de5879f6a27e8d65341e40e28e01b439e11c4f21c7a86d59d687fcdfe34ca"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:fe08ba03de51d04bdbc4ef4559106643b0ed422c26146c72069a2831f4bb08cb",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:fe08ba03de51d04bdbc4ef4559106643b0ed422c26146c72069a2831f4bb08cb",
    "tagSymlink": "3813e043",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:ad89936da3510643ac92087fedfc71965cb4b1e2e1845162f6e04eeb02b5f857",
     "sha256:3808e1084febf2ee4d32e2ae6334c4feb17c1ac57df3c30d514227514cbd4a2c",
     "sha256:60133217c4f4d5cc1e778e92f7de31a527ff43846aaebe5db6dd5d9978d7c2fb"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-operator-bundle@sha256:be095b227df301a7067f1663405faf2b984441613f14576606b98c781f0353dd",
    "path": "odf4/odf-csi-addons-operator-bundle",
    "id": "sha256:be095b227df301a7067f1663405faf2b984441613f14576606b98c781f0353dd",
    "tagSymlink": "fdf236e6",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d580196089a3ec7c23cf23e84dd2f233f262941cfb45bd802e54e4ce4748fa08",
     "sha256:0c805426bac6794c96c57ea0f25bee2ea82703df48ec5da99d01bd1b73cf458a"
    ]
   },
   {
    "name": "sha256:285af876515891957d6afc5182fca519a2e7bd6d29488dd121be3e0ae5c52c45",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:285af876515891957d6afc5182fca519a2e7bd6d29488dd121be3e0ae5c52c45",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
     "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
     "sha256:c73620c202e30f7ae901039b5b7b72ac0e2e650e82a3924a5cad62d94f78b923",
     "sha256:dd00585cbd9cabe8c6f9609d2cd31396e256d6e7dbe48feee704102df07924cb"
    ]
   },
   {
    "name": "sha256:a639ff8d8380173956c8ec25186d2382f7d9eece795a9f913afb98d0f54ffa64",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:a639ff8d8380173956c8ec25186d2382f7d9eece795a9f913afb98d0f54ffa64",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
     "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
     "sha256:34527608ca5327151cd31ceb75f4eaa041a956060e33c6d205f7665271626fdd",
     "sha256:9d409a2324159e5a0583c015c8c134be7d0030105db42da4a125745fe7f4e0bc"
    ]
   },
   {
    "name": "sha256:68a3a70c02d20ec6d075cfc18edcb118fa6eb4b78600ca460448eeaca0ab0922",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:68a3a70c02d20ec6d075cfc18edcb118fa6eb4b78600ca460448eeaca0ab0922",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
     "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
     "sha256:3ff7234a3df85e1d7ecdda9119a66353e59ee86784006c56c3ed984758284581",
     "sha256:a75f51534fef869c5a9a174aaeab64493e0b7505166931c48fcfc8f0dad39038"
    ]
   },
   {
    "name": "sha256:995f4fad844d47dd91c3b5e8680620f9906d4e6e1ea4ec42bd5e06a7c3989a40",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:995f4fad844d47dd91c3b5e8680620f9906d4e6e1ea4ec42bd5e06a7c3989a40",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
     "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
     "sha256:1acc65a3b6c75698c3873a8f393fde62b7f8c735b973efd522ac2ffb70505974",
     "sha256:511396624419354077b77efcbdcf700dabb2ba88069e42f4937aaefb579295bd"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-resizer@sha256:e2fb943852ae1c55f88a1d1668b6f375a60cbc0f7373559aff190775ad2a7f87",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:e2fb943852ae1c55f88a1d1668b6f375a60cbc0f7373559aff190775ad2a7f87",
    "tagSymlink": "40c540f3",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:285af876515891957d6afc5182fca519a2e7bd6d29488dd121be3e0ae5c52c45",
     "sha256:a639ff8d8380173956c8ec25186d2382f7d9eece795a9f913afb98d0f54ffa64",
     "sha256:68a3a70c02d20ec6d075cfc18edcb118fa6eb4b78600ca460448eeaca0ab0922",
     "sha256:995f4fad844d47dd91c3b5e8680620f9906d4e6e1ea4ec42bd5e06a7c3989a40"
    ]
   },
   {
    "name": "sha256:3df935837634adb5df8080ac7263c7fb4c4f9d8fd45b36e32ca4fb802bdeaecc",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:3df935837634adb5df8080ac7263c7fb4c4f9d8fd45b36e32ca4fb802bdeaecc",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
     "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
     "sha256:b3ab75b621f05b60d60c8297db620b289f26ea50d706d4617574a4ed5967ec5c",
     "sha256:eb9d5c9681cd5609e14c7ef072925d3e797b25ae23cf300ca0466224f9b4d23e"
    ]
   },
   {
    "name": "sha256:2d8319a33aa781918a3173e2061635d8534cc5e4a39171775830ff7e2ce646ac",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:2d8319a33aa781918a3173e2061635d8534cc5e4a39171775830ff7e2ce646ac",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
     "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
     "sha256:846e2012e7aea7302d76838b0eb599f1605138e22fbeb1c494413e28b5534ec6",
     "sha256:1b1364165968e37f00f814d0f48257dc7a86a260e9f3b032ead712dc56f90702"
    ]
   },
   {
    "name": "sha256:9ed69f7ca0d8a273ecc777332cb2cd7f87c8ec340192fd62381ae7cc0c2cc40c",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:9ed69f7ca0d8a273ecc777332cb2cd7f87c8ec340192fd62381ae7cc0c2cc40c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
     "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
     "sha256:17268e31a0438ca2bfcfb6bb9d25198aa90c8396a1806ba68c2b8324a233faa7",
     "sha256:7b5a80e576e70ccee98a4d75bafe3feeb50793096ec5e2500997ce5b805c0a35"
    ]
   },
   {
    "name": "sha256:45e2301078f2237ddb7147d2761c94ad2ec1e95a79c2120ef5d9d97270a5494b",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:45e2301078f2237ddb7147d2761c94ad2ec1e95a79c2120ef5d9d97270a5494b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
     "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
     "sha256:e7983e5cc7d187e5cd9e590bf6376de61219917bfbe4d0451ab9a425d81b36fd",
     "sha256:2be97eb64495c9b1fa1b8f4079430301cb7d3d8eb4b6aa52af6d3fa73eada065"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:3658954f199040b0f244945c94955f794ee68008657421002e1b32962e7c30fc",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:3658954f199040b0f244945c94955f794ee68008657421002e1b32962e7c30fc",
    "tagSymlink": "2657ea06",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:3df935837634adb5df8080ac7263c7fb4c4f9d8fd45b36e32ca4fb802bdeaecc",
     "sha256:2d8319a33aa781918a3173e2061635d8534cc5e4a39171775830ff7e2ce646ac",
     "sha256:9ed69f7ca0d8a273ecc777332cb2cd7f87c8ec340192fd62381ae7cc0c2cc40c",
     "sha256:45e2301078f2237ddb7147d2761c94ad2ec1e95a79c2120ef5d9d97270a5494b"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-node-driver-registrar@sha256:8db12de76d7f7e80439ac2a9fb731993fcb46447749664ee804bcc9cf9301859",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:8db12de76d7f7e80439ac2a9fb731993fcb46447749664ee804bcc9cf9301859",
    "tagSymlink": "d158fc7",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:2ca588ae8217d6e52a960e89beff794f7041591f6a040bb106769a854960ecd4",
     "sha256:120b4367014f3c261fc1842b2386f12c5d451ffe9e4a92615869389fb949c6a1",
     "sha256:7dd914fee7cd7be10370b94bef6594e3cddb80fa50accf32d45816c49ecbd159",
     "sha256:a19ae7fd01d86951507b7038e1a2c5a11514f729e542fad8dbe8af4c97cf3975"
    ]
   },
   {
    "name": "sha256:2ca588ae8217d6e52a960e89beff794f7041591f6a040bb106769a854960ecd4",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:2ca588ae8217d6e52a960e89beff794f7041591f6a040bb106769a854960ecd4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
     "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
     "sha256:125cd38c41c890de3345e1a3a55223f5d59b8d7a489665e52abbad4ec32a72c1",
     "sha256:87b434338ac09015ceb4b8308b591807a1b2bf5b2349a78f6d5678ecb71452a5"
    ]
   },
   {
    "name": "sha256:120b4367014f3c261fc1842b2386f12c5d451ffe9e4a92615869389fb949c6a1",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:120b4367014f3c261fc1842b2386f12c5d451ffe9e4a92615869389fb949c6a1",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
     "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
     "sha256:7f04d359b4e1c357a36a160409704b645101c94818ea55df68a65633b4230e00",
     "sha256:641fbfcea4bed10d0b3f5f0f2e109f435ff7028c8b7ce7d833b47dd441b21564"
    ]
   },
   {
    "name": "sha256:7dd914fee7cd7be10370b94bef6594e3cddb80fa50accf32d45816c49ecbd159",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:7dd914fee7cd7be10370b94bef6594e3cddb80fa50accf32d45816c49ecbd159",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
     "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
     "sha256:b50f120c61b4039e30e73c40a0eb4a0108664eeb2a2fda88674a2f26a64536ae",
     "sha256:44b87bdf42d518320a05a669acc58b988125dbc7302644d06bc35ae3b18cb380"
    ]
   },
   {
    "name": "sha256:a19ae7fd01d86951507b7038e1a2c5a11514f729e542fad8dbe8af4c97cf3975",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:a19ae7fd01d86951507b7038e1a2c5a11514f729e542fad8dbe8af4c97cf3975",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
     "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
     "sha256:8e17b25df98be50be446a4f15d69a57c2108094818dad9f38454443e41584075",
     "sha256:973acb1f6f967c914d6aee9e39541d21e1bc7880ccca5864e87c30b35dfed2c5"
    ]
   },
   {
    "name": "sha256:57d765f210d5aadc288a5ea5b8229effd18874e10ba7ae6a5fbbe53d745796e5",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:57d765f210d5aadc288a5ea5b8229effd18874e10ba7ae6a5fbbe53d745796e5",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e3e51c76147a5eb97c0cbd60ce298c9ee459790888cc11a4dbba3e0f7ba0c5d1",
     "sha256:edfd1b5d7e75a67aba56631ee915129d44d1557bf3110ee605728a8002b34d23",
     "sha256:e3ea1e8005cd0ae31880d7cc7f58965bf15f5ded21d765403594380f6c635955",
     "sha256:8a69e40d5bb18d9eb5264feb27b4eef0930a11af7da2484c98119d2ccd8f023e"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:0f23899af9031663308ea7501b35236387238567bafd5d10295bc4726f45c2ae",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:0f23899af9031663308ea7501b35236387238567bafd5d10295bc4726f45c2ae",
    "tagSymlink": "56010884",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:d7f0286b395ff43611c591c1406a2f37821246a5543d24acfb92ccf622384fba",
     "sha256:7da72672ed9f83988c559614794b5368093e28de7ec218a793b103c86be1490b",
     "sha256:57d765f210d5aadc288a5ea5b8229effd18874e10ba7ae6a5fbbe53d745796e5"
    ]
   },
   {
    "name": "sha256:d7f0286b395ff43611c591c1406a2f37821246a5543d24acfb92ccf622384fba",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:d7f0286b395ff43611c591c1406a2f37821246a5543d24acfb92ccf622384fba",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:a9e23b64ace00a199db21d302292b434e9d3956d79319d958ecc19603d00c946",
     "sha256:38b71301a1d9df24c98b5a5ee8515404f42c929003ad8b13ab83d2de7de34dec",
     "sha256:938cfe696c14eb0b980d1c1e314cc44561d1d328a0ba693b2f79154bb31fd4da",
     "sha256:d323687ab7ab077967acda87e0283acce6355497152ad6527b96eaaf145a0b86"
    ]
   },
   {
    "name": "sha256:7da72672ed9f83988c559614794b5368093e28de7ec218a793b103c86be1490b",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:7da72672ed9f83988c559614794b5368093e28de7ec218a793b103c86be1490b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:661f8c7fec3094a509f67e483b6aa71612adc4fa44a011d68524c65fcd9e226f",
     "sha256:0a66d8076c9db262c20586a7e350914f3b101008366a97e58c6d85bcf3311efa",
     "sha256:59c1a3bee3423e7ba1adeed70a618ebbe72fdd4bebce56e6bff11342c2fe8941",
     "sha256:a588a26919750eadccf7316406ad8da242ea795bc9f84e053a3e3d2eaee51b64"
    ]
   },
   {
    "name": "sha256:11d03e12451b549eab21f314cf0f0e6618eaa6059762e12c9c98b0af6f774eaa",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:11d03e12451b549eab21f314cf0f0e6618eaa6059762e12c9c98b0af6f774eaa",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
     "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
     "sha256:95736960492113cf6f57b057e0bd5bec485e84a32bcfd087afa88452078e4cbd",
     "sha256:0dae53999ce2826ad4f72434e2c655db99c93328841e3879d4f2edf6b7723ad7"
    ]
   },
   {
    "name": "sha256:52eac073361e7888baae963abe32b5331701b7aa6c80a8d9ea1ebd3370fcb105",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:52eac073361e7888baae963abe32b5331701b7aa6c80a8d9ea1ebd3370fcb105",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
     "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
     "sha256:82bc3e338c6caac36f01df11719e918f944040f849683e8871caa12d9134a197",
     "sha256:77c5578555fabd2d05ac8d75223d50a7f42592997d6845f1d2b5d7dc3f85c11e"
    ]
   },
   {
    "name": "sha256:8e5c388d11228105aa69ab8aa6dd5b49b1b51a6effd9c44feff3fcdcf9e1d5b4",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:8e5c388d11228105aa69ab8aa6dd5b49b1b51a6effd9c44feff3fcdcf9e1d5b4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
     "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
     "sha256:5a13aec661b7876e73db8bae7a096cf1ef7a6ea1d281820fcd2808affa754cf9",
     "sha256:154cf2429f7c806aa6a5723a7970b5f9d76779b59d9afe427a2df6f62a0e812d"
    ]
   },
   {
    "name": "sha256:9dff38526f0ac825b58f466b0d6bc4954bc5d401c7faa8d10de6c69e0a9b2720",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:9dff38526f0ac825b58f466b0d6bc4954bc5d401c7faa8d10de6c69e0a9b2720",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
     "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
     "sha256:a1973e30290f3dc67ce1c09f0e29b6e57540ebf0172fe8b46a5e9036453d0a35",
     "sha256:ec8ef51d30631cd93c74db851d69bedb846bdacf6d5e752f2e8cd69e77f205d1"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-node-driver-registrar@sha256:90792483c531bfa2c51e5be45efdc0e52e3e2461a4c9a6921428d719415dc8b0",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:90792483c531bfa2c51e5be45efdc0e52e3e2461a4c9a6921428d719415dc8b0",
    "tagSymlink": "88c12bdc",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:11d03e12451b549eab21f314cf0f0e6618eaa6059762e12c9c98b0af6f774eaa",
     "sha256:52eac073361e7888baae963abe32b5331701b7aa6c80a8d9ea1ebd3370fcb105",
     "sha256:8e5c388d11228105aa69ab8aa6dd5b49b1b51a6effd9c44feff3fcdcf9e1d5b4",
     "sha256:9dff38526f0ac825b58f466b0d6bc4954bc5d401c7faa8d10de6c69e0a9b2720"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:338f2ded01b446ca9e6e1d83d904e7e78ba2a15694cb8216433dca1bc16c977d",
    "path": "odf4/mcg-operator-bundle",
    "id": "sha256:338f2ded01b446ca9e6e1d83d904e7e78ba2a15694cb8216433dca1bc16c977d",
    "tagSymlink": "3b619111",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:fbeb28fb40e1647ea45018399f0ab43155436d935bee4f74a034dff0de1e4f33",
     "sha256:4888597f6b43b1d90a004b2a1966b7a73dbdf77e5e4cef3ee30161f08b166b34"
    ]
   },
   {
    "name": "sha256:b11c5f1586fec9dc4793dd5b96cd84791460e9879e862b7b513a7fa3a55384f5",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:b11c5f1586fec9dc4793dd5b96cd84791460e9879e862b7b513a7fa3a55384f5",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
     "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
     "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
     "sha256:0c5d2340c248d2ff8d1dfdb1bbe8070bc2e83cfd44717293d95e1ae0402e9f26",
     "sha256:75175c9a975d0e3f82b54724b17b52cb64fed3e5cd8aa1140f07fa8562165a03"
    ]
   },
   {
    "name": "sha256:6722074f8f40998748881b79530c795dcb2f3d2fdffa4dc48dbe44b8c2d04637",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:6722074f8f40998748881b79530c795dcb2f3d2fdffa4dc48dbe44b8c2d04637",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
     "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
     "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
     "sha256:7187c86e9afc5be63df3301b3a4bc90d9868e69417525cae18f8cb631ba5b56f",
     "sha256:3facd0ff1c9edeccbb22cdf26453e7477f2f9ed1a47edbb4dca83c61720cb679"
    ]
   },
   {
    "name": "sha256:d312dba57576825eb79e6a1e04454cce18b73a0e4d19192c468aca6bed69b03f",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:d312dba57576825eb79e6a1e04454cce18b73a0e4d19192c468aca6bed69b03f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
     "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
     "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
     "sha256:152b17e6f69a9ad6d042ea6ced2f7ea4d7238d7faab1de4563777584ac02bfc0",
     "sha256:ee39cb5b3d00940c11a7d2c3545a0fe4a903702cbae6eff9e193558c778e6252"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:b574d632936d350ce69f554a5da65a43227ab2105ec0cb890eadf2ec5f0c5e33",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:b574d632936d350ce69f554a5da65a43227ab2105ec0cb890eadf2ec5f0c5e33",
    "tagSymlink": "689f44a7",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:b11c5f1586fec9dc4793dd5b96cd84791460e9879e862b7b513a7fa3a55384f5",
     "sha256:6722074f8f40998748881b79530c795dcb2f3d2fdffa4dc48dbe44b8c2d04637",
     "sha256:d312dba57576825eb79e6a1e04454cce18b73a0e4d19192c468aca6bed69b03f"
    ]
   },
   {
    "name": "sha256:de5e00dfb7b4deff09ab7fc83894c274d09990dc066f7b3b207c0071d9e0ab00",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:de5e00dfb7b4deff09ab7fc83894c274d09990dc066f7b3b207c0071d9e0ab00",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
     "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
     "sha256:787758a4a3596c5eb023c3f375a8f583ec7af27d4ee8997aa4e681812e81af0e",
     "sha256:3629eb29ccd3049d5919ea3ed69950210f6f1283fa25606b398fa0a09ed38163"
    ]
   },
   {
    "name": "sha256:f68a055e6538d9b2b04a13ca543ca8f72ed3a659f518862bc57787239ca7cdb8",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:f68a055e6538d9b2b04a13ca543ca8f72ed3a659f518862bc57787239ca7cdb8",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
     "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
     "sha256:a251eefb4b6c566939e05b499812793c3ad7c9e4ab2642db523fb083d103fae3",
     "sha256:cbd5d0bfc977f2bd1ef987d7774923fd5b2366203339ce968e292fda65972496"
    ]
   },
   {
    "name": "sha256:b962c27b8c5a7241769866984403b70242cddb2981ac00805cd06db102bee19c",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:b962c27b8c5a7241769866984403b70242cddb2981ac00805cd06db102bee19c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
     "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
     "sha256:56265dee362ffe166792541357a9185a17159870f8d62de3ea127c2561f419fb",
     "sha256:213d27f9fed8a6285d38d539876a7da2e67a93326783b31c992665059c194677"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:522a3496e76a921df258f09509e8532ad963fedbc74c282b6e412e0cce7c2f28",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:522a3496e76a921df258f09509e8532ad963fedbc74c282b6e412e0cce7c2f28",
    "tagSymlink": "5debde69",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:de5e00dfb7b4deff09ab7fc83894c274d09990dc066f7b3b207c0071d9e0ab00",
     "sha256:f68a055e6538d9b2b04a13ca543ca8f72ed3a659f518862bc57787239ca7cdb8",
     "sha256:b962c27b8c5a7241769866984403b70242cddb2981ac00805cd06db102bee19c"
    ]
   },
   {
    "name": "sha256:3fd5abf8575901f8767f6c16b7292d4dee3db3d2f67d880816556f732b85f561",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:3fd5abf8575901f8767f6c16b7292d4dee3db3d2f67d880816556f732b85f561",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:3d4679d6550ed04bed8f137eccb2f5198efb4491950ec50f15831eda1b6ad963",
     "sha256:ebd5e372fd9eeeb6cf72dace1739f03e57e4e455e6847ae3b9b719b9047c3c6c",
     "sha256:b01bce94b999d5d3749604f16676f68d6250aa412f9cd55c72316dea4829eabf"
    ]
   },
   {
    "name": "sha256:432d27b68fc233b3064c6fdcacc009f181c92be20c598f3d9daff063761a30b2",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:432d27b68fc233b3064c6fdcacc009f181c92be20c598f3d9daff063761a30b2",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:abad6baafc4cb0a77e481dea4a8bc47a7ed5b5c944d494c18bfbec3aeba4e8cc",
     "sha256:7f6958b3f9b37a37e83436801b2cfa682876b2e5c32c6d15e53354d3259ccdbd",
     "sha256:0b08a5d3b21505c482af4755ff696cace4b3e3b9407ebce453912b10cd37c70a"
    ]
   },
   {
    "name": "sha256:e7ca9c85a1ba70fc7523d02e940b51ca5dc8b3fc895971c81e0f3681fb5e56fb",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:e7ca9c85a1ba70fc7523d02e940b51ca5dc8b3fc895971c81e0f3681fb5e56fb",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:ac3143d6092da265fe38fcde94e5aa790146bc14fc0580c8093e76bac041cda5",
     "sha256:e88acdd86e05d8f703e0a5782e0c388753ed7e742478fddd36351e36506882e0",
     "sha256:8f6edfdaf629483f03c377faaf02ca6bf295f104bca2f0d4850c38b237dc83e8"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:01caee70dcd8eec596863049256c757e0f39cbf87dfdfde557053f3be58bea3d",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:01caee70dcd8eec596863049256c757e0f39cbf87dfdfde557053f3be58bea3d",
    "tagSymlink": "ad6afec7",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:3fd5abf8575901f8767f6c16b7292d4dee3db3d2f67d880816556f732b85f561",
     "sha256:432d27b68fc233b3064c6fdcacc009f181c92be20c598f3d9daff063761a30b2",
     "sha256:e7ca9c85a1ba70fc7523d02e940b51ca5dc8b3fc895971c81e0f3681fb5e56fb"
    ]
   },
   {
    "name": "sha256:1ed80c2b8eacf8376ef274dff1e8248054b6c7fa83d8fbb05b7b6b6aa64d6c3c",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:1ed80c2b8eacf8376ef274dff1e8248054b6c7fa83d8fbb05b7b6b6aa64d6c3c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:6b7813843375be5e0214ec8237b1fc201392465e4a7362a3261c8f3db4745013",
     "sha256:e9c88c5ea38d53656a57729a0df240cf6c94620483ef89b612a0b16fff8dd0c3"
    ]
   },
   {
    "name": "sha256:f5a05b98f9ba8a9ece3e09d684fd0d6734137d578dd0d0e11a23010ffa733993",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:f5a05b98f9ba8a9ece3e09d684fd0d6734137d578dd0d0e11a23010ffa733993",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:7d2062c526eb8caa07941ad221bf417d471b3697cf036f9dfeaa072fc13cb658",
     "sha256:21a5bb8bbb953bedf28c944938f8d3561ced4148f066407e90c0ad823467f980"
    ]
   },
   {
    "name": "sha256:67961c4ff4f632eae6819647c525f0beec2f76622a2e9c1613b3454a674d1fd0",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:67961c4ff4f632eae6819647c525f0beec2f76622a2e9c1613b3454a674d1fd0",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:0b23df69181077267a19f9404c0ab6f5d79a79b8f615341370266e248e94a854",
     "sha256:27dccca561abce1ec836cc4ea37e03f3247fbc696c684b7cdc2cc71cdf64d20a"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-rhel8-operator@sha256:9ca68ff20b805c4ed458c8f6dcab6833bcd8c656278ab3e69aa945960a699fe0",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:9ca68ff20b805c4ed458c8f6dcab6833bcd8c656278ab3e69aa945960a699fe0",
    "tagSymlink": "3d44e037",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:1ed80c2b8eacf8376ef274dff1e8248054b6c7fa83d8fbb05b7b6b6aa64d6c3c",
     "sha256:f5a05b98f9ba8a9ece3e09d684fd0d6734137d578dd0d0e11a23010ffa733993",
     "sha256:67961c4ff4f632eae6819647c525f0beec2f76622a2e9c1613b3454a674d1fd0"
    ]
   },
   {
    "name": "sha256:c6446d2c3975141010cc201b339f4df06fa76706fccf0efcd55f21ce0f9c695c",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:c6446d2c3975141010cc201b339f4df06fa76706fccf0efcd55f21ce0f9c695c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
     "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
     "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
     "sha256:ec8dd2e6cc4a8e800bdc7d95375cf22e29efa3c4260045298165e586bfb640f4",
     "sha256:d1e9d9fb0b7af054b90fd6fbc1db947de03027383a3986fb8623b75bd21a66d6"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:98f3cea84e4f25fbd0e55439c31d7a7870449fea050bf41cad3867d9036cacf0",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:98f3cea84e4f25fbd0e55439c31d7a7870449fea050bf41cad3867d9036cacf0",
    "tagSymlink": "97047474",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:36888d4ae8c40f58a031dbfaeed49dd13b0ff6b43403e41401fb7e3bfdee4032",
     "sha256:4da96689013683b8c903bc95958b8f1b35de15a4ea219c6664caf63b50c50a67",
     "sha256:c6446d2c3975141010cc201b339f4df06fa76706fccf0efcd55f21ce0f9c695c"
    ]
   },
   {
    "name": "sha256:36888d4ae8c40f58a031dbfaeed49dd13b0ff6b43403e41401fb7e3bfdee4032",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:36888d4ae8c40f58a031dbfaeed49dd13b0ff6b43403e41401fb7e3bfdee4032",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
     "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
     "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
     "sha256:11ec953f29b40850309441ef947410538317902cd1d9741476cc4d2d3c93b793",
     "sha256:2f84a6258fa7c83c9b09ba81a11dbe1cf3725260525609599c01d1668c97eee7"
    ]
   },
   {
    "name": "sha256:4da96689013683b8c903bc95958b8f1b35de15a4ea219c6664caf63b50c50a67",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:4da96689013683b8c903bc95958b8f1b35de15a4ea219c6664caf63b50c50a67",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
     "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
     "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
     "sha256:37b8f2b7b2776e2a18cb7d15f0372610170c72671f316016287e7a4927b1468d",
     "sha256:8e014ea3f33ffe45a8b013bfb0e5a8ccc02773acc7e2b0d17773ebccfc54915e"
    ]
   },
   {
    "name": "sha256:e6162ae89bf73e29c304080e868d47f13c46e389c6f2f6bde856ebeda20306f5",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:e6162ae89bf73e29c304080e868d47f13c46e389c6f2f6bde856ebeda20306f5",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:510abfcdf6bce7517c9dbde8fd24c03d8f36fe1503f65a712f824401f857aac7",
     "sha256:4a3604715398d774a2abb75d31b035aa4099557f7016e27550cefc9759368cda",
     "sha256:b1858bd7e64bc3c6f055aed1cc736d5856e1b4e682fb8c9f0610deee16e8b86c",
     "sha256:ab782b054d3b24d4f78c772569a5d289222a021f2dbd806224e1cf33e648501b"
    ]
   },
   {
    "name": "sha256:4a4bd7a6b537d75aaa982c308eedc805809c2576f5d75498a432991c7e199534",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:4a4bd7a6b537d75aaa982c308eedc805809c2576f5d75498a432991c7e199534",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f2cdfe33b637eca2019910dbfd9c00211fe1aeda61fe42b23f08bb74a91e72f5",
     "sha256:6d9e8294c3485a103e1bccd5ab429804c39e30fa9217e9b8e15154afe93e3167",
     "sha256:22ea396101b498c9d91573e641b65ee4ea92580ae07f390088edb696877f4363",
     "sha256:95f24e07e5f81b739ca12a4af0876c87a744e9f4d9e140f38011caadd381ac22"
    ]
   },
   {
    "name": "sha256:ae593d312597211d35a2d89cefdcf879eb1db1eac9bfdc76c756be78b111b5e7",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:ae593d312597211d35a2d89cefdcf879eb1db1eac9bfdc76c756be78b111b5e7",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92491c8a90cf467336f6e7d283809c4de69e0141bdcf17c023b1edf310c8f678",
     "sha256:be2d37fed3de60e335e761ccc650ef174a17f8be5660b42bc5cc227b557aa13c",
     "sha256:a3f25dd179d93de69756b41e8a03e52cf32321fccf2f4e2e420f1ecc210f4ab1",
     "sha256:8af9676f44dada86112a0ce9f26119e1f14fad5ff0da75b62a2dcedf64820281"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:a94616d282a27ddae1c69ae73ffd1917e141ca3b3d6d0dcf1ec5268293f211fc",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:a94616d282a27ddae1c69ae73ffd1917e141ca3b3d6d0dcf1ec5268293f211fc",
    "tagSymlink": "e82dc2f1",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:e6162ae89bf73e29c304080e868d47f13c46e389c6f2f6bde856ebeda20306f5",
     "sha256:4a4bd7a6b537d75aaa982c308eedc805809c2576f5d75498a432991c7e199534",
     "sha256:ae593d312597211d35a2d89cefdcf879eb1db1eac9bfdc76c756be78b111b5e7"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:1ef46ddbbee55cc94fb69e55517483d9191c6ddd64f3161cccfa0727f0a50d1d",
    "path": "odf4/mcg-operator-bundle",
    "id": "sha256:1ef46ddbbee55cc94fb69e55517483d9191c6ddd64f3161cccfa0727f0a50d1d",
    "tagSymlink": "5d261315",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:85826689e91e75e0266665635d8da280b9d2f4792bd22bae810dd2e1ba78a2c6",
     "sha256:29d694f526478a7c760b9832fb9cbb70e56ed602d0041598aa527cea2cba5932"
    ]
   },
   {
    "name": "sha256:3b3d0401dec6c7e1710b8e4a8c29a88a9bef1ed318bf570db1f344f5d31b3cbc",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:3b3d0401dec6c7e1710b8e4a8c29a88a9bef1ed318bf570db1f344f5d31b3cbc",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
     "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
     "sha256:1a51fdc4dea0890ac86174af981ae0b06dd72b81a5ee9135c1c3db1e75776e86",
     "sha256:4ab735bee8233bdc36f03a3a688bbad3b0abbfd37adb02aa10cc59d8c794d63e"
    ]
   },
   {
    "name": "sha256:735ab4c8b1061dc6cc97fe54a2e21abf5f5f7e643f9ae6155845e68bf96a401b",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:735ab4c8b1061dc6cc97fe54a2e21abf5f5f7e643f9ae6155845e68bf96a401b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
     "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
     "sha256:2cc5e8062db81de6483c7a412cc24b322d6003255a5ee5b70ab514c055ec88d9",
     "sha256:fabb4ea5b6a06984d775022732f828747b8f7a642b9e705bc23510e046d3c3b8"
    ]
   },
   {
    "name": "sha256:fbe5cf3be8cc23d1d994e62d5ab08face3de033f1838b2fb07599631c7df1c8b",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:fbe5cf3be8cc23d1d994e62d5ab08face3de033f1838b2fb07599631c7df1c8b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
     "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
     "sha256:fb9f760c9a9cdd2c1bf696352f6e638fc7408b212db849616c0f1fb9be6dde6d",
     "sha256:f6e8be2377b6333288e8500266307fc9984d451561b54e71dc6a4f0f5865aae4"
    ]
   },
   {
    "name": "sha256:02ded9f847070a0e89d7e448fe8fe195a8077f714c6bdb56394f840c7f280000",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:02ded9f847070a0e89d7e448fe8fe195a8077f714c6bdb56394f840c7f280000",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
     "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
     "sha256:2047a773b1dde72990f99c1fc10f8cc4eb3c86bf6a0d00e4f91be0d453de2f2e",
     "sha256:030f78b21570298816f9d337d9b88832a46944bee62847d09e07ecb60ca20cc0"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:8503a9bab5ea92bc6f7f8cdc00b4dab8e73103973d17b0bfdbf921d15cd9a4c0",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:8503a9bab5ea92bc6f7f8cdc00b4dab8e73103973d17b0bfdbf921d15cd9a4c0",
    "tagSymlink": "519fb1b6",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:3b3d0401dec6c7e1710b8e4a8c29a88a9bef1ed318bf570db1f344f5d31b3cbc",
     "sha256:735ab4c8b1061dc6cc97fe54a2e21abf5f5f7e643f9ae6155845e68bf96a401b",
     "sha256:fbe5cf3be8cc23d1d994e62d5ab08face3de033f1838b2fb07599631c7df1c8b",
     "sha256:02ded9f847070a0e89d7e448fe8fe195a8077f714c6bdb56394f840c7f280000"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-local-storage-operator-bundle@sha256:c49ff0e65acaa9622e08101e38debfe7615bf46eb461d59f0c7e729c1195c961",
    "path": "openshift4/ose-local-storage-operator-bundle",
    "id": "sha256:c49ff0e65acaa9622e08101e38debfe7615bf46eb461d59f0c7e729c1195c961",
    "tagSymlink": "a79c9326",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:967c59406255f29fc9508219b2b1176d17dacc3f5d98bce8f419e66f7adce1b5",
     "sha256:17f6e9558b118b3890aeaa5eeafbaed5004bfc070ca22cabdf314f3465ffb0bf"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:60cb495cd4230eb5709c71dbcf64d8380438bde845abe026f06237bc6dede58f",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:60cb495cd4230eb5709c71dbcf64d8380438bde845abe026f06237bc6dede58f",
    "tagSymlink": "f6fe50a3",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:1490f6450046ee1618e23edfe91efbf2b416990a654a8f9cb6a390f8ea041aed",
     "sha256:c29bf5a76486cec63642ea83ed39cf52e6522aa8a5673ca7f57462fb4e2c163f",
     "sha256:f7e9d3a9e07bc4bcce8ca42866945e943cd6e0836ef70c3800fe14350a770721"
    ]
   },
   {
    "name": "sha256:1490f6450046ee1618e23edfe91efbf2b416990a654a8f9cb6a390f8ea041aed",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:1490f6450046ee1618e23edfe91efbf2b416990a654a8f9cb6a390f8ea041aed",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:ad97e575305d0fe909119e65ccb5d87c548cd57a184031a1ae3d625374239b8b",
     "sha256:6769672a4f0ff52966e1802a3ec0cbdd474a1000072b4e5a473c6bf02ab4e11d"
    ]
   },
   {
    "name": "sha256:c29bf5a76486cec63642ea83ed39cf52e6522aa8a5673ca7f57462fb4e2c163f",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:c29bf5a76486cec63642ea83ed39cf52e6522aa8a5673ca7f57462fb4e2c163f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:5c8dc6dbe4d5fc364e2920ccaa0787f00a1fef9f8b9eaec56cacf52bdbec5a68",
     "sha256:81e58d224900216681284e04bbe5bcc19316cdf1ce057b047014f4329616a0a5"
    ]
   },
   {
    "name": "sha256:f7e9d3a9e07bc4bcce8ca42866945e943cd6e0836ef70c3800fe14350a770721",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:f7e9d3a9e07bc4bcce8ca42866945e943cd6e0836ef70c3800fe14350a770721",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:fbe11182d31208e22a172f7d1aa02f210ea40e7b427dea13c047a18075d0a26d",
     "sha256:ceeb36a1813e8c31819081c6a37a53a07f3f03b50768be3c23294f1c9576a3ff"
    ]
   },
   {
    "name": "sha256:057faab26a423611a690f90ad525a2452a4a78dcfbcf1d5563110cccdc9b3f3b",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:057faab26a423611a690f90ad525a2452a4a78dcfbcf1d5563110cccdc9b3f3b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:0a06c35b757c03ce6846267a97bf28da46ac26dd82bd3f39689e29f8af4fc4bd",
     "sha256:5bed39d73bd4d86abcbbe97ee6f74b99b3d6d9258d512eeaafbdf8578435cac7"
    ]
   },
   {
    "name": "sha256:b73a21003a203ed398858ca8d6ce3a91f8c63412f8ab9be43f0de75235aa6941",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:b73a21003a203ed398858ca8d6ce3a91f8c63412f8ab9be43f0de75235aa6941",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:b9b8907c867eaa8a63f45cbdc01707758067626644a2cb41f28fdfd9eb38006b",
     "sha256:204d1db375e6f107b1a5822ace25ca2b9e778c86fc2a9e7eb09bcba4044eaf47"
    ]
   },
   {
    "name": "sha256:6ef935f1f158d5557a4a200796e08b43c619e4c0c38eefce54b18d4ffda8140d",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:6ef935f1f158d5557a4a200796e08b43c619e4c0c38eefce54b18d4ffda8140d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:2f097c75a4f341c2d39faa688c17d64ab1e9933bb07d7f7a8f9a0cc43bbd6b3d",
     "sha256:ff3ae85b6432c91ebf4dd54c5e6a0f5db8a74c9b76ab6ba247d69053aafd84fa"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:3b359006d7b17b3416f9b29dad7bc35e26c6d0d21feacdb71282514b2c76e151",
    "path": "odf4/ocs-rhel8-operator",
    "id": "sha256:3b359006d7b17b3416f9b29dad7bc35e26c6d0d21feacdb71282514b2c76e151",
    "tagSymlink": "47650600",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:057faab26a423611a690f90ad525a2452a4a78dcfbcf1d5563110cccdc9b3f3b",
     "sha256:b73a21003a203ed398858ca8d6ce3a91f8c63412f8ab9be43f0de75235aa6941",
     "sha256:6ef935f1f158d5557a4a200796e08b43c619e4c0c38eefce54b18d4ffda8140d"
    ]
   },
   {
    "name": "sha256:70c99ac6ee5b4787ca471929b17a57a6d2842b3b52b9bbba13996330060c1fa5",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:70c99ac6ee5b4787ca471929b17a57a6d2842b3b52b9bbba13996330060c1fa5",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
     "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
     "sha256:8aa7fec08d608847a3bedb5fb4e4bb13d5392d9f2c078632434d2df69d2c8c59",
     "sha256:6dd68e5624ddbbd0f967cdd223a6e621966e43ce5517ff668e4beaf3f77bd1e2"
    ]
   },
   {
    "name": "sha256:c89dd3e4633489c40647a3bad96a5bae24fa56bad03aba68ce852e5fa6e1045b",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:c89dd3e4633489c40647a3bad96a5bae24fa56bad03aba68ce852e5fa6e1045b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
     "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
     "sha256:1f2ee84a39231c5d8af5b3d3a99f4123b912989f5b606aeae307a7520b2d0b95",
     "sha256:292256665bf3b044fb89662960147e0dcc90b349e592d175c3cccbd43a064eb1"
    ]
   },
   {
    "name": "sha256:a1796587fcdbb680fbc3045a9934712695b46d3af782f04f2138e946266d1823",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:a1796587fcdbb680fbc3045a9934712695b46d3af782f04f2138e946266d1823",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
     "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
     "sha256:f12529c54255192499d807bf357eb5ab596c33f8b9317dab5e81830579cd8511",
     "sha256:9fb19fbab26328209060199fb81de66792436c30dd347b14cca064e255fe677f"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-node-driver-registrar@sha256:3308ef98afab494b80aa1a702924407cf114bce6e0ad92436e508d7dc951521c",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:3308ef98afab494b80aa1a702924407cf114bce6e0ad92436e508d7dc951521c",
    "tagSymlink": "e30e1b37",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:f2f0465327384d567f80dda5123d6d95d0e44659cdc5cbc37d58c56cac863e82",
     "sha256:70c99ac6ee5b4787ca471929b17a57a6d2842b3b52b9bbba13996330060c1fa5",
     "sha256:c89dd3e4633489c40647a3bad96a5bae24fa56bad03aba68ce852e5fa6e1045b",
     "sha256:a1796587fcdbb680fbc3045a9934712695b46d3af782f04f2138e946266d1823"
    ]
   },
   {
    "name": "sha256:f2f0465327384d567f80dda5123d6d95d0e44659cdc5cbc37d58c56cac863e82",
    "path": "openshift4/ose-csi-node-driver-registrar",
    "id": "sha256:f2f0465327384d567f80dda5123d6d95d0e44659cdc5cbc37d58c56cac863e82",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
     "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
     "sha256:6ea7421ed0d52818cda9c866ec3e6b0fc07f83328f01b5e762e07ef3740177a5",
     "sha256:033beb41d6369d0584920966345fb79c6b59a9b20b68a323ab6844f26ec7fbe7"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:baf051a5c64d8f85ae2701131ee96cb100a81ce4bed77d3a8962fd44d4d2b6b0",
    "path": "odf4/mcg-operator-bundle",
    "id": "sha256:baf051a5c64d8f85ae2701131ee96cb100a81ce4bed77d3a8962fd44d4d2b6b0",
    "tagSymlink": "12067fe8",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:1c8512cbaef01f40fe8a8821364d1721b2658ca6b4f5beca4caa54329aaa0e4d",
     "sha256:e44b552b4a741af4cdd84519c7ab74ad9566d2251837451da3547b68862a8d3f"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:dc4d9a53dea5573e3020ad5d1ea1018705b6be25294c722d29f57bd90564c58c",
    "path": "odf4/odf-operator-bundle",
    "id": "sha256:dc4d9a53dea5573e3020ad5d1ea1018705b6be25294c722d29f57bd90564c58c",
    "tagSymlink": "8e911a44",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:9b0c130e0a69189b65ff5390aa02a77956b45b0225966c6e6e81ea84bbc65abc",
     "sha256:4d29eb73ff6c64274a7952b924d6af3c4498fe28e3e9543e46b6d1ba85c925ad"
    ]
   },
   {
    "name": "sha256:3bc56e5f54ca3c4fb602f189bb215e23fc2f8d8c8d8a9471aa7dd80fa3b589b8",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:3bc56e5f54ca3c4fb602f189bb215e23fc2f8d8c8d8a9471aa7dd80fa3b589b8",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
     "sha256:b56af1360c83e0a0479bf161b3ec392c8c513f8e8104700c8ed696fe4b261c8d",
     "sha256:baa2b02f458888a9ce370968887299f96f8687ffe7fe9784360f8d5231ef60dc",
     "sha256:b0eb8d3033872241913cc97cb4ef9e9b8e52e3584b8c3a3dfbc38332f17501aa"
    ]
   },
   {
    "name": "sha256:ad28823be3f64dc5a8ebee74398d32c091b2d803e97caf64ebf8e58c273beaf8",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:ad28823be3f64dc5a8ebee74398d32c091b2d803e97caf64ebf8e58c273beaf8",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
     "sha256:74f1fb7a06eab765809ca437e035b054dcfb1e6ecb3158ecc8a9076b6f26210f",
     "sha256:a582bcdda8138937d47aac899fc6a963eed49529006be12dd401bd91a4ef9db1",
     "sha256:31216a6baeea34467944d7a09ad27c58aec23d87058bd0f69aa73d0bf3a2eb2a"
    ]
   },
   {
    "name": "sha256:4b9a7ac6918fee220b636bdde3e72865070a237ed5a213b5e8f379e598f03335",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:4b9a7ac6918fee220b636bdde3e72865070a237ed5a213b5e8f379e598f03335",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
     "sha256:9510f581bc6968bd3717fd248986be74458e606ee275a794d769df8d1e544640",
     "sha256:81edae57b824e905e551c3ae21dca3d1d92e7539ccd0f434d51441fd8743feec",
     "sha256:2b39c5e34be2a2e6fed20467851d869e47fd0568388ae5672729743cf2d94dac"
    ]
   },
   {
    "name": "sha256:59fd3f133a215e5033f1b2a9374be64534f8990e4b9ca13c6040b386febd5ed9",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:59fd3f133a215e5033f1b2a9374be64534f8990e4b9ca13c6040b386febd5ed9",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
     "sha256:39504606388e1d44d94d8a1b2d37e37c80a5453590aaa0ec5b1c8b510a77750f",
     "sha256:64271a6a4a100cb6a2922a4f2c32a04e258f4a47d423ce0079bf472f9208153d",
     "sha256:bb2450aeb475cae7b001b234d04c71f5b6523d2f6e96edd9a957101c9e343565"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:a60cbabfba11788c7870ff050f7cb7fea8edfc9128c14e3fbe3056aa9bf68eed",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:a60cbabfba11788c7870ff050f7cb7fea8edfc9128c14e3fbe3056aa9bf68eed",
    "tagSymlink": "7d54c882",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:3bc56e5f54ca3c4fb602f189bb215e23fc2f8d8c8d8a9471aa7dd80fa3b589b8",
     "sha256:ad28823be3f64dc5a8ebee74398d32c091b2d803e97caf64ebf8e58c273beaf8",
     "sha256:4b9a7ac6918fee220b636bdde3e72865070a237ed5a213b5e8f379e598f03335",
     "sha256:59fd3f133a215e5033f1b2a9374be64534f8990e4b9ca13c6040b386febd5ed9"
    ]
   },
   {
    "name": "sha256:8c80b3ac044018512283fc03419eac5e12654f8b855333b16a63522b5f62b507",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:8c80b3ac044018512283fc03419eac5e12654f8b855333b16a63522b5f62b507",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:da6cf90000f1e8c68029513a3674919c4c460ed472ba88ccbaa046c74ddcc951",
     "sha256:92c3cd1997868b9ccce823c559765bc77f5bbc8ad061d6a81d382c568a21fb58",
     "sha256:8b327b4fbce925c4c8f970e8416dd6bfc11acd0de23c616bb719ef77e84b9f0c",
     "sha256:7f2d8c36f2242504b22164200c7a66ae3a5fdc8e9bd91f556767f282008eabd1"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:65167c53c27c19f5d35961b71e61c6fe0d6f35f8a03ad1d79937f3109f3c416a",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:65167c53c27c19f5d35961b71e61c6fe0d6f35f8a03ad1d79937f3109f3c416a",
    "tagSymlink": "ba2b5ff",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:946749ba48c473467aacae977de10d5daf0a30fea1434af6af8718ea39f3675c",
     "sha256:45c28f91d0063c8ed9c9810b45e16f69825e07e824f3d9262cf1119914fc10a1",
     "sha256:8c80b3ac044018512283fc03419eac5e12654f8b855333b16a63522b5f62b507"
    ]
   },
   {
    "name": "sha256:946749ba48c473467aacae977de10d5daf0a30fea1434af6af8718ea39f3675c",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:946749ba48c473467aacae977de10d5daf0a30fea1434af6af8718ea39f3675c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:0c1fd83997e17b079085107d40f89cea2211f9ec3db88d5241019a85d06db5a7",
     "sha256:e76fbc91af5d560232191ef55c8366dcc52e0f8d4ddf97ba6140329787db6c39",
     "sha256:ca31dba25a30991a1458a32b511c542d93e4d06be8ce0004758b34c95d8bbefe",
     "sha256:7ea49f984feb11fd2d9ac8fb630d0546d68df1aa6f5561b2737ec32abaf6d9b3"
    ]
   },
   {
    "name": "sha256:45c28f91d0063c8ed9c9810b45e16f69825e07e824f3d9262cf1119914fc10a1",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:45c28f91d0063c8ed9c9810b45e16f69825e07e824f3d9262cf1119914fc10a1",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:d2be686e74da7c701311c471acf80b269afb9a3165314de5aa2b9a6df6562fd7",
     "sha256:98a3f59d1db45f44899db07a0f1cbc3525c9e1cfa91805892ecabbe31ee7a769",
     "sha256:865cfdacf254247870a230b8e5f527ebfc318fe7ad3979663ddb4ea39ce95988",
     "sha256:7c442469df1896c1f2a2e0ca4b37824f7001ff9015e7665df265b7d444a7e3b3"
    ]
   },
   {
    "name": "sha256:7dc93a9627bf75b2fbfdde6b93d886d41f2f25f2026136e9a93d92de8c8913b9",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:7dc93a9627bf75b2fbfdde6b93d886d41f2f25f2026136e9a93d92de8c8913b9",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:3d4679d6550ed04bed8f137eccb2f5198efb4491950ec50f15831eda1b6ad963",
     "sha256:854c5a1705725e2b9078068ed1340c8000accb605f2b01295d366fea6ca18079"
    ]
   },
   {
    "name": "sha256:a3a092408fce7b1cd7d6c321e266ff6603598924af14e375abfbacc6eb186bb7",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:a3a092408fce7b1cd7d6c321e266ff6603598924af14e375abfbacc6eb186bb7",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:abad6baafc4cb0a77e481dea4a8bc47a7ed5b5c944d494c18bfbec3aeba4e8cc",
     "sha256:f9e824c6a711e299f7c6ec88e76c9b5e949ba6ffc9d52024cf09521f12bb7654"
    ]
   },
   {
    "name": "sha256:b560b6906a4eff2b10883e180da37ab18046af6c4c918ba8fe931045dadcafef",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:b560b6906a4eff2b10883e180da37ab18046af6c4c918ba8fe931045dadcafef",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:ac3143d6092da265fe38fcde94e5aa790146bc14fc0580c8093e76bac041cda5",
     "sha256:b55f94f2be53b8322bdb867d1dc7c3560eb1e69778cc908b943afc803a669a1d"
    ]
   },
   {
    "name": "registry.redhat.io/rhceph/rhceph-5-rhel8@sha256:b20a05e20403da9775408fde0f10ba9c81c5610a3814db7786dd43ce4b2aba4a",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:b20a05e20403da9775408fde0f10ba9c81c5610a3814db7786dd43ce4b2aba4a",
    "tagSymlink": "abb353a2",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:7dc93a9627bf75b2fbfdde6b93d886d41f2f25f2026136e9a93d92de8c8913b9",
     "sha256:a3a092408fce7b1cd7d6c321e266ff6603598924af14e375abfbacc6eb186bb7",
     "sha256:b560b6906a4eff2b10883e180da37ab18046af6c4c918ba8fe931045dadcafef"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/kubernetes-nmstate-operator-bundle@sha256:e1dde590c46e18be23d7c7f1b235d506894e790e118d32d74c6f90ae023c1bc2",
    "path": "openshift4/kubernetes-nmstate-operator-bundle",
    "id": "sha256:e1dde590c46e18be23d7c7f1b235d506894e790e118d32d74c6f90ae023c1bc2",
    "tagSymlink": "39899794",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:391caca0b71d28d42f451280c98651af417420b035474ee31dad659d5a533226",
     "sha256:d7b02170dfeb641171db5d25dc1ddad9f0ed48d643ba98eea057cacf4900d5c6"
    ]
   },
   {
    "name": "sha256:134c0561a171adb65f961729ba49ffa016d13bff02f844f01e992e5c49bc3077",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:134c0561a171adb65f961729ba49ffa016d13bff02f844f01e992e5c49bc3077",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
     "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
     "sha256:b3834351fe9b5cdd62d3ff24218dbab88c140b142e4cf330d4522cd6b41bc066",
     "sha256:2e95a664b257291175cbf71a3851b185bf2c6d59f089d5b41381dd41a6c49d70"
    ]
   },
   {
    "name": "sha256:974fa8e19bbe1e01d3a0fcf6ce30b0b31fd1281eebc155e4e6e6b898f9a11ac4",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:974fa8e19bbe1e01d3a0fcf6ce30b0b31fd1281eebc155e4e6e6b898f9a11ac4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
     "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
     "sha256:75870b1bfa34c0def3c74b5f1cb433997da532d376be1d0c8f08f4d326989e44",
     "sha256:9ce723015eb5e6853586230224b642934fb688f13d614c78b599bf2aac6777ac"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:6fe55db39e35676eeb62a5ab685baea8c402fdcb9f67a32484f0663f53c59327",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:6fe55db39e35676eeb62a5ab685baea8c402fdcb9f67a32484f0663f53c59327",
    "tagSymlink": "ff0fce42",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:015116d6a075e2133159ec1e88ff40c7d1b42ff0905381feca318ca82eae6e7a",
     "sha256:134c0561a171adb65f961729ba49ffa016d13bff02f844f01e992e5c49bc3077",
     "sha256:974fa8e19bbe1e01d3a0fcf6ce30b0b31fd1281eebc155e4e6e6b898f9a11ac4"
    ]
   },
   {
    "name": "sha256:015116d6a075e2133159ec1e88ff40c7d1b42ff0905381feca318ca82eae6e7a",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:015116d6a075e2133159ec1e88ff40c7d1b42ff0905381feca318ca82eae6e7a",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
     "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
     "sha256:6f4c8192b5f1e8de4cef82c78a73e15c6bd12fcf6adf1d388ae1d1b47df7dd07",
     "sha256:e09b7ec2d5d143cd110066ea8885c26f0946a7eea6873a92712f688575e2bb60"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:1cbe53d6e1ebbbacef1bcb5459aa3ad882568aa006b059bd334287363eb35aae",
    "path": "odf4/ocs-operator-bundle",
    "id": "sha256:1cbe53d6e1ebbbacef1bcb5459aa3ad882568aa006b059bd334287363eb35aae",
    "tagSymlink": "8df71831",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:511c3b6b090ef36d2e7c946dc7ed28378b218a26f964540d5aebf5c384039785",
     "sha256:f9acc026c1596b5a3e5c346681b3ea72cff8adc67478d6bca2be075d5224b0a9"
    ]
   },
   {
    "name": "sha256:34cec4367e440fad721be18fa1e9d0db205bb6ed062b3fac6a5dd4e28b09a8ff",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:34cec4367e440fad721be18fa1e9d0db205bb6ed062b3fac6a5dd4e28b09a8ff",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
     "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
     "sha256:3814be84c20669ecdf132c0ce1c2dc9312a641b0fbbdcc172d25c7cd6e85a5e3",
     "sha256:2602a9c069fa21f42aae80270e728d3c520309c39533d34be5436690cf029011"
    ]
   },
   {
    "name": "sha256:49c58a5d51f05446e248b587689aefb9cf67e074a5851979d4139de42043badc",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:49c58a5d51f05446e248b587689aefb9cf67e074a5851979d4139de42043badc",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
     "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
     "sha256:73b9e7ec2bde4a770be0d35a70d0d43af4c67000c71120e6169083c60a3f46c3",
     "sha256:5b4c7acd18bdde3a983ec40a1e238566a283cd760d6e38f379131c3aff73f9da"
    ]
   },
   {
    "name": "sha256:602c5e023667e31d9e779c7c1d37a26c22ca6a36d909510620a047cfd898b406",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:602c5e023667e31d9e779c7c1d37a26c22ca6a36d909510620a047cfd898b406",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
     "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
     "sha256:5493396eeb4ec100805cf34cd1a0ba6dea547ed09b943a76911130a996530f2a",
     "sha256:31bdf7ffadcbc577aedaf11f0e559c579395e2317b8cf23bec8540046b39f57d"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-resizer@sha256:519a0e644866b001f1b975ec05fd271f73c27bd45f713746e812e7827b6770c9",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:519a0e644866b001f1b975ec05fd271f73c27bd45f713746e812e7827b6770c9",
    "tagSymlink": "b29c7fa2",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:3d8ec1ae4a0601215900a844787182eb1298528472c8cffa824a31a9f10c8a7b",
     "sha256:34cec4367e440fad721be18fa1e9d0db205bb6ed062b3fac6a5dd4e28b09a8ff",
     "sha256:49c58a5d51f05446e248b587689aefb9cf67e074a5851979d4139de42043badc",
     "sha256:602c5e023667e31d9e779c7c1d37a26c22ca6a36d909510620a047cfd898b406"
    ]
   },
   {
    "name": "sha256:3d8ec1ae4a0601215900a844787182eb1298528472c8cffa824a31a9f10c8a7b",
    "path": "openshift4/ose-csi-external-resizer",
    "id": "sha256:3d8ec1ae4a0601215900a844787182eb1298528472c8cffa824a31a9f10c8a7b",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
     "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
     "sha256:9637136331026232820cae9762b477dcb7bf17237d77ea4fde6ea3a197c1458f",
     "sha256:441f73b5613af96297573590a2aa41e5a789f0a89d5ccbe35a446125e8f93387"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:662ec108960703f41652ff47b49e6a509a52fe244d52891d320b821dd9521f55",
    "path": "odf4/odf-operator-bundle",
    "id": "sha256:662ec108960703f41652ff47b49e6a509a52fe244d52891d320b821dd9521f55",
    "tagSymlink": "9f4fe91c",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:2a1e45641c394d85682323f95b633249acfe013553aa77b053e7250b49847bf6",
     "sha256:80d0a4b62813fbb512ae57929f230ec6a64e7272e43054ad189c36094d92f33d"
    ]
   },
   {
    "name": "sha256:cbbefa6e573f826a2ecf8574e0cd46e845de9b31cdda74fdc9621be508fef3c6",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:cbbefa6e573f826a2ecf8574e0cd46e845de9b31cdda74fdc9621be508fef3c6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
     "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
     "sha256:3ba15d43afbde327717915464dfd74eb10b69903195113bec6c18e450773dbdb",
     "sha256:263623c4c4f945914af1efe5a02d4cab9d371687f1a6994cf7d4100127b08fc3"
    ]
   },
   {
    "name": "sha256:4b8142242a022d635b36abea1ae64aadebeed9ad0dd25852d6ace7dd818016f0",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:4b8142242a022d635b36abea1ae64aadebeed9ad0dd25852d6ace7dd818016f0",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
     "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
     "sha256:dcff36ed68c88a2bfcd3afbca628bc3717da5ab6e65d56640a6910fe19a12a6d",
     "sha256:012272a7579544eac03b6e9118d78b8b057f250b005e46b6ed08b89b7c14ba3d"
    ]
   },
   {
    "name": "sha256:480c819fa76d86eec8a89a70f3d30687ffcc52d1af792579ca73cf7d6b134f0e",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:480c819fa76d86eec8a89a70f3d30687ffcc52d1af792579ca73cf7d6b134f0e",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
     "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
     "sha256:6014771eacaaff55e67e287384f564c6d38032a09dedfbeff32c461655f20a77",
     "sha256:42a2a186d41e3765c539f75341282453c98baa13f1b56e570f4ffe202abd00ba"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-provisioner@sha256:0521f532c721ca946d802966633d9bc5bc08e642f3a765fee293b449441f90bb",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:0521f532c721ca946d802966633d9bc5bc08e642f3a765fee293b449441f90bb",
    "tagSymlink": "d8f70fd4",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:24cc533f1b81b8c79bd99bcfd8c7f94d07503591f46d53af8467002a4a6266a1",
     "sha256:cbbefa6e573f826a2ecf8574e0cd46e845de9b31cdda74fdc9621be508fef3c6",
     "sha256:4b8142242a022d635b36abea1ae64aadebeed9ad0dd25852d6ace7dd818016f0",
     "sha256:480c819fa76d86eec8a89a70f3d30687ffcc52d1af792579ca73cf7d6b134f0e"
    ]
   },
   {
    "name": "sha256:24cc533f1b81b8c79bd99bcfd8c7f94d07503591f46d53af8467002a4a6266a1",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:24cc533f1b81b8c79bd99bcfd8c7f94d07503591f46d53af8467002a4a6266a1",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
     "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
     "sha256:6471c927fdb07b22109ed5e64c52608041c4c52cbd4236f31c0ffe91b4b46af2",
     "sha256:1c5f99013ab26f1c86cad8fe1044d92cea5d7566930b26613cf31445f3ae3a87"
    ]
   },
   {
    "name": "sha256:103c0819d23256bc5e7046410c43c94b03c7976738694feeb413f2c25b3b8f9f",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:103c0819d23256bc5e7046410c43c94b03c7976738694feeb413f2c25b3b8f9f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:65627708fc00242c21d206f20fb300b4842b3ecc95740fb8cf72b306dd31105d",
     "sha256:3ce43719c1237d93898319e06c63ff8447dc24be4b9ba8c0004a2a3672692dbb"
    ]
   },
   {
    "name": "sha256:4ae3eb20b4c710033d667e4fdae5f9750f8e03d62bf4626225e02611375eddd5",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:4ae3eb20b4c710033d667e4fdae5f9750f8e03d62bf4626225e02611375eddd5",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:6246994597dd390eef367fb32568439866cdf1443f55ee6910cfa7ccebaaf5e8",
     "sha256:1108b9c7dabe3552ef871302b223e490de4184ccddf782efe669a231c957c54d"
    ]
   },
   {
    "name": "sha256:226572d567c1ec07965b1295d99c132537f42fe71214eb79b54481f55b0926a8",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:226572d567c1ec07965b1295d99c132537f42fe71214eb79b54481f55b0926a8",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:6cbab348a5013af518ab4e3968b3bdebe05987b9ef2de75ff2a7d37aae734752",
     "sha256:7d2e8e380cacc6f04c0abeb116edc447914fbf77f7795f9ac629d71c0309a01d"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:f017b85cd6469eca2c95b9a695ccf424de49d5807dd25143fd9f1255506c00a8",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:f017b85cd6469eca2c95b9a695ccf424de49d5807dd25143fd9f1255506c00a8",
    "tagSymlink": "47f573c7",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:103c0819d23256bc5e7046410c43c94b03c7976738694feeb413f2c25b3b8f9f",
     "sha256:4ae3eb20b4c710033d667e4fdae5f9750f8e03d62bf4626225e02611375eddd5",
     "sha256:226572d567c1ec07965b1295d99c132537f42fe71214eb79b54481f55b0926a8"
    ]
   },
   {
    "name": "sha256:629f6067d450d2e8ccf93197d5bf44a10a5501adfe934ed6f4bd1643354e6496",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:629f6067d450d2e8ccf93197d5bf44a10a5501adfe934ed6f4bd1643354e6496",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:3d4679d6550ed04bed8f137eccb2f5198efb4491950ec50f15831eda1b6ad963",
     "sha256:5546738feec5eb09935bf7014926e6bcb8049d73764d50dc11ae164f11deccb8",
     "sha256:c36f60027bd59ef6ce62ee866244da7c0a5cdd6d614836215a6ce23d8105fb20"
    ]
   },
   {
    "name": "sha256:66f5feaa037fbb0a3bb47ddccd775c591d9070fca3750deca74bf058a7889499",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:66f5feaa037fbb0a3bb47ddccd775c591d9070fca3750deca74bf058a7889499",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:abad6baafc4cb0a77e481dea4a8bc47a7ed5b5c944d494c18bfbec3aeba4e8cc",
     "sha256:f8b6518a01c5213dc4b985dee1a3ab5c102b8ae2f51ce1197ab9c2e2b3854ead",
     "sha256:47da4a42793c30b814cf65746745144995f03e92e5e744d0625f593eebd734c0"
    ]
   },
   {
    "name": "sha256:cc9ee225fd1e0094dd73155ea1dae1da3abc0e136835ad844f98244948247246",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:cc9ee225fd1e0094dd73155ea1dae1da3abc0e136835ad844f98244948247246",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:ac3143d6092da265fe38fcde94e5aa790146bc14fc0580c8093e76bac041cda5",
     "sha256:daafde1802a6994c387b4d0073ed6a97993dd356fffcf125737638c7dcee8c95",
     "sha256:6ba3d67fd04fec610118bcfce997805f5f9797bc8a15818cbf6457009080b6c5"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:9e2380c42a6c00fe2cced9baadb71d3dcb78ec0e64034203033b3c1d7d82b233",
    "path": "odf4/rook-ceph-rhel8-operator",
    "id": "sha256:9e2380c42a6c00fe2cced9baadb71d3dcb78ec0e64034203033b3c1d7d82b233",
    "tagSymlink": "5257ebbe",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:629f6067d450d2e8ccf93197d5bf44a10a5501adfe934ed6f4bd1643354e6496",
     "sha256:66f5feaa037fbb0a3bb47ddccd775c591d9070fca3750deca74bf058a7889499",
     "sha256:cc9ee225fd1e0094dd73155ea1dae1da3abc0e136835ad844f98244948247246"
    ]
   },
   {
    "name": "sha256:f15139b941df32b25eeba961d4401f9518bd5f78f2cd4c1560d8f51fe75ded8f",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:f15139b941df32b25eeba961d4401f9518bd5f78f2cd4c1560d8f51fe75ded8f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
     "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
     "sha256:bb6c009b1f28251d380c066ab170e8cbbb3bacd8eb2f82c50877f77d5920f693",
     "sha256:c0cfa1478ca9015ceb990703aa4c985afa69560ebfb8c8418dadc8b6bca9bc0c"
    ]
   },
   {
    "name": "sha256:61283bec3d3600feab582b3a755a0ce902b9b7e3711b0a73373b14b5ec33c53d",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:61283bec3d3600feab582b3a755a0ce902b9b7e3711b0a73373b14b5ec33c53d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
     "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
     "sha256:e565cc8719280bfaeea78ea249fd3b28d161b430de621e0c3c3937516bc6bc57",
     "sha256:f637054c65b0b40cb4475bd8277e3145d58f8df24b2022d500fc639370e95fcb"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-attacher@sha256:47d907d24cf9a0cb4496af688785a8485eddfebd70379f082bd58fd2883a46bc",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:47d907d24cf9a0cb4496af688785a8485eddfebd70379f082bd58fd2883a46bc",
    "tagSymlink": "a077187a",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:ed2a3ffb5bcc749255ec4a194763c8f2739dc58fb00489ec1ebaee22ba85c527",
     "sha256:529333833d11d38c066a6348efcd7003db77e20a53533cf4a26e362a522eac71",
     "sha256:f15139b941df32b25eeba961d4401f9518bd5f78f2cd4c1560d8f51fe75ded8f",
     "sha256:61283bec3d3600feab582b3a755a0ce902b9b7e3711b0a73373b14b5ec33c53d"
    ]
   },
   {
    "name": "sha256:ed2a3ffb5bcc749255ec4a194763c8f2739dc58fb00489ec1ebaee22ba85c527",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:ed2a3ffb5bcc749255ec4a194763c8f2739dc58fb00489ec1ebaee22ba85c527",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
     "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
     "sha256:fa0f649116d57cb1e71e21390648e1b8d28020bd6c1ce9de6f59754cc997e5d6",
     "sha256:8dc8589a740137593585f23b60ffe5ead16ba2fc393f91f5fc973eb5fbeb78ac"
    ]
   },
   {
    "name": "sha256:529333833d11d38c066a6348efcd7003db77e20a53533cf4a26e362a522eac71",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:529333833d11d38c066a6348efcd7003db77e20a53533cf4a26e362a522eac71",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
     "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
     "sha256:82c8ac24f94dee8d28fa6febb4afc7b07a1a9b32011c1b81c4a74965d82b0a56",
     "sha256:1c300c4421a2656761d7565eda6c95ca35ba9c47f1f502af2a988c87a9717824"
    ]
   },
   {
    "name": "sha256:1dac1bef2b7911432d8b6a5ed8141fe009080a414f3b5f1740892900bb9a5744",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:1dac1bef2b7911432d8b6a5ed8141fe009080a414f3b5f1740892900bb9a5744",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
     "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
     "sha256:3d282acae4c22e0475521cf2a7cfbc607794980818865fde289619005345de98",
     "sha256:986a969f4ac6665ba7baab2cbf3a69b0b9476c0dc94944a6535e31dbe15b71af"
    ]
   },
   {
    "name": "sha256:845d24c10e90d6700d3bb93516d59db70417964783a765136c07c01f1391e87d",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:845d24c10e90d6700d3bb93516d59db70417964783a765136c07c01f1391e87d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
     "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
     "sha256:a805e0e82d1e807c9784567660413c0744fbb2fccf94264885afb86cede3d463",
     "sha256:7818fdfc08bdfd6b986a69692cb4bd6d6beb5ddc8b93107482c26f6e81abb989"
    ]
   },
   {
    "name": "sha256:37a342edfbe3b5375fa94c806ee293c191975d553ae68f716f0c11d6fd31951f",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:37a342edfbe3b5375fa94c806ee293c191975d553ae68f716f0c11d6fd31951f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
     "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
     "sha256:ea4cea25854d327c37416691329f9193e845a80c71f557f4c17d57dd864eb4b2",
     "sha256:129c703953c3fd5f18493de9ce1bec5ef87195c97f5cd2cb19b1293827e24d41"
    ]
   },
   {
    "name": "sha256:9c979593429d4e0096a14459828002edad09fd71dbaf274c5d94cbaba394e8e0",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:9c979593429d4e0096a14459828002edad09fd71dbaf274c5d94cbaba394e8e0",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
     "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
     "sha256:18a1e127cb9b358cb10f3b093405c25ddb04e36ef4ded2c935b38cc195dae452",
     "sha256:f850f5027288df34903c6380d821c189a7812811213987df1c403463d81819a1"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-attacher@sha256:9b1c595785ebf3dacef11bcb95829a785456d7c0dad6b595a9c8284d559b079b",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:9b1c595785ebf3dacef11bcb95829a785456d7c0dad6b595a9c8284d559b079b",
    "tagSymlink": "88d4dbfa",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:1dac1bef2b7911432d8b6a5ed8141fe009080a414f3b5f1740892900bb9a5744",
     "sha256:845d24c10e90d6700d3bb93516d59db70417964783a765136c07c01f1391e87d",
     "sha256:37a342edfbe3b5375fa94c806ee293c191975d553ae68f716f0c11d6fd31951f",
     "sha256:9c979593429d4e0096a14459828002edad09fd71dbaf274c5d94cbaba394e8e0"
    ]
   },
   {
    "name": "sha256:809b9533510e33d478b7bd82ee8bf06f4b9843d140c400e90545fb2ecf7a3036",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:809b9533510e33d478b7bd82ee8bf06f4b9843d140c400e90545fb2ecf7a3036",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
     "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
     "sha256:8a9f981d1a2d205a822c7b460605d5b8415865998e59dd99bf03f11112ae3c8f",
     "sha256:4a3d9af02f2746e8b83ba365095fffde31c98abe2c99d4db4b6576396cfc3cd2"
    ]
   },
   {
    "name": "sha256:a4281fc7ec884c80896e5e3f976042233e78e7055ed2fa973b755a6c8c84fd8f",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:a4281fc7ec884c80896e5e3f976042233e78e7055ed2fa973b755a6c8c84fd8f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
     "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
     "sha256:c8ee32327818966e1456f824c1fef1332c7a039eeb40c6b75c5ee1ad8ac956ed",
     "sha256:3d0b0c2fcbd4a7dfbddddd178646b669d1ecf552ef8c80b0411b2c636df092cb"
    ]
   },
   {
    "name": "sha256:01b68866f8426559e3287f8c23ac5a9f01eea566d65257d1d6c972c9f6e95e7d",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:01b68866f8426559e3287f8c23ac5a9f01eea566d65257d1d6c972c9f6e95e7d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
     "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
     "sha256:0e82e4b20943092f7035da9b8b081e7186c82d27c7a64baf921fd99679019d97",
     "sha256:1b95a7dc55895caa0f0697c501d98943ad13b12a27268a22f7039a5bf7374293"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-rhel8-operator@sha256:38eb3ad7e6c186e6a6ea06d7bf080601526a93c63aad538d67213904ae6a5db3",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:38eb3ad7e6c186e6a6ea06d7bf080601526a93c63aad538d67213904ae6a5db3",
    "tagSymlink": "37f6973f",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:809b9533510e33d478b7bd82ee8bf06f4b9843d140c400e90545fb2ecf7a3036",
     "sha256:a4281fc7ec884c80896e5e3f976042233e78e7055ed2fa973b755a6c8c84fd8f",
     "sha256:01b68866f8426559e3287f8c23ac5a9f01eea566d65257d1d6c972c9f6e95e7d"
    ]
   },
   {
    "name": "sha256:55b7c96cf870d6afdf79bf0bd170096a04b99d2edaa5173e51ff3a8934ad2720",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:55b7c96cf870d6afdf79bf0bd170096a04b99d2edaa5173e51ff3a8934ad2720",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:2d19f5c578bff65c862573cb16cc006e3b2ed20fedf5a7db0ee4e3f3ca98261b",
     "sha256:a3d6cefbf56de4db1b2d3f583d5166b18b338601d3ac9ac75b7f27fcc259c0a7"
    ]
   },
   {
    "name": "sha256:1ab1758d199c68fa96eec27dc2b03c8cf8b5585d3cc3e9eb55fac51bbf620906",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:1ab1758d199c68fa96eec27dc2b03c8cf8b5585d3cc3e9eb55fac51bbf620906",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:32b99b51a5791f7c1cc2fe54140515af9760ad8ecf438b29705141a7c2f8660d",
     "sha256:27f63fb5b091c728694cc84cb2b07b4f022b7c24953abc2f12236de8412d46e7"
    ]
   },
   {
    "name": "sha256:f2705a25e28b2a27533def0a0a98731993bfc2a280c13fb126a16b0e21b2a70c",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:f2705a25e28b2a27533def0a0a98731993bfc2a280c13fb126a16b0e21b2a70c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:ae0bac2b84044140b992621171917bc6c4e6b61cc949f05a1c7e682c3d937228",
     "sha256:52c931688d739d665be9d4831efea30ea62507c17e99027893b35d4a0436ac95"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:96d1590494e8d4d402426affba7f79239ecdc92195b8888220d2a4cdd229b0af",
    "path": "odf4/mcg-rhel8-operator",
    "id": "sha256:96d1590494e8d4d402426affba7f79239ecdc92195b8888220d2a4cdd229b0af",
    "tagSymlink": "41796b1a",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:55b7c96cf870d6afdf79bf0bd170096a04b99d2edaa5173e51ff3a8934ad2720",
     "sha256:1ab1758d199c68fa96eec27dc2b03c8cf8b5585d3cc3e9eb55fac51bbf620906",
     "sha256:f2705a25e28b2a27533def0a0a98731993bfc2a280c13fb126a16b0e21b2a70c"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:550221e4c4ddb57da3a811f5bdda5003079670fe84ebd7e74d3ce4177d5ea831",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:550221e4c4ddb57da3a811f5bdda5003079670fe84ebd7e74d3ce4177d5ea831",
    "tagSymlink": "740a4fac",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:ab9906801e3f605ceb0f6c420099ca4e011d0a81d2093c23eb9cd3e3f04295a6",
     "sha256:34bfe91b29d5acb807ce6cbf1337d07aa713e48bc9d7dc9db1fc220a14d5ec37",
     "sha256:0f5de60cbf4785719e0ff38f45810bb9f9bf3efef67d42f431161266849cbef9"
    ]
   },
   {
    "name": "sha256:ab9906801e3f605ceb0f6c420099ca4e011d0a81d2093c23eb9cd3e3f04295a6",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:ab9906801e3f605ceb0f6c420099ca4e011d0a81d2093c23eb9cd3e3f04295a6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
     "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
     "sha256:3d87d1870b9dcc9348ebdc921ff709e8591de06d0b92f2e86a0c8de6455c34de",
     "sha256:d4ca04606a80d42aef561157f2d87fe96f33d15294c453eda9ed5c579f47736e"
    ]
   },
   {
    "name": "sha256:34bfe91b29d5acb807ce6cbf1337d07aa713e48bc9d7dc9db1fc220a14d5ec37",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:34bfe91b29d5acb807ce6cbf1337d07aa713e48bc9d7dc9db1fc220a14d5ec37",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
     "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
     "sha256:e9f9ac5b11c0bc506e5241848bb1d391a8849ace373e007145d97dbb6b9109bc",
     "sha256:f4f5c60beda6d7b0fc6f48358ffa89968a23432ca9880f589f5c4166eae70029"
    ]
   },
   {
    "name": "sha256:0f5de60cbf4785719e0ff38f45810bb9f9bf3efef67d42f431161266849cbef9",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:0f5de60cbf4785719e0ff38f45810bb9f9bf3efef67d42f431161266849cbef9",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
     "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
     "sha256:f3bf45bda20aeeab91305b23ad5ce9f7206ec29fcee2e038aa0bb9b750578fca",
     "sha256:4cea1d7f8c57565501caecdaa3302983a7a849c80da9b50298298f85fd3ab52d"
    ]
   },
   {
    "name": "sha256:22eaf1d54ca67731874c5b3fa1acdb3af194e2ee1d44ce96be15730e73db715d",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:22eaf1d54ca67731874c5b3fa1acdb3af194e2ee1d44ce96be15730e73db715d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
     "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
     "sha256:aec584187c1df4b4776087c093a1c8727fe4f78229f652455e03130b0ba52a55",
     "sha256:c2943e5d09f55a7bd6b6ed161c348c8ad57331819a1e0b8713690e3a0403762a"
    ]
   },
   {
    "name": "sha256:4bf2e662e2e60904de44f770f9b4fafb0ca1172eebffb590c52a355be59ec3f8",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:4bf2e662e2e60904de44f770f9b4fafb0ca1172eebffb590c52a355be59ec3f8",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
     "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
     "sha256:41ca1a14bf175356380f2590c599ce70890774d8292e42bc4c9299da7219b542",
     "sha256:61e957296d6b62e50caca4b67e97af6ac168afa0592a50206c1008e94177802d"
    ]
   },
   {
    "name": "sha256:a1691a41ddeb091310d9a67b5e720a31dedad11d94c8ecc136dc4487c4f162a3",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:a1691a41ddeb091310d9a67b5e720a31dedad11d94c8ecc136dc4487c4f162a3",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
     "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
     "sha256:76570aa0dade2f2ae737714bb94a93fa1c69060d35066c2b944978535452326b",
     "sha256:cdf0bb5d277eb2811da243ecfcf7873c3282a9a4a2b455b0c5de3a62725c3c0a"
    ]
   },
   {
    "name": "sha256:6974ffb36403ddee403ae654da11bc1ac8f6c51cf7113026a1ae1c456878688d",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:6974ffb36403ddee403ae654da11bc1ac8f6c51cf7113026a1ae1c456878688d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
     "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
     "sha256:a0b90c657a782bdfdf74017bf99ca8a8a0950db82628a18b0ab4092bd020f963",
     "sha256:7616b8e10307e313d049953d83b1feae4a104a676f8063987133d11cd4c79626"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:b8109aa8cb1f87d52afdfcb3e87382e197ca5983121409a6aaa1c7340004cc19",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:b8109aa8cb1f87d52afdfcb3e87382e197ca5983121409a6aaa1c7340004cc19",
    "tagSymlink": "40e61e6",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:22eaf1d54ca67731874c5b3fa1acdb3af194e2ee1d44ce96be15730e73db715d",
     "sha256:4bf2e662e2e60904de44f770f9b4fafb0ca1172eebffb590c52a355be59ec3f8",
     "sha256:a1691a41ddeb091310d9a67b5e720a31dedad11d94c8ecc136dc4487c4f162a3",
     "sha256:6974ffb36403ddee403ae654da11bc1ac8f6c51cf7113026a1ae1c456878688d"
    ]
   },
   {
    "name": "sha256:daf64c7005798c8239ff3e6801f1d3c69ff563b6c95ac6e31ccdadbd4603350d",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:daf64c7005798c8239ff3e6801f1d3c69ff563b6c95ac6e31ccdadbd4603350d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
     "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
     "sha256:b99d042fdbefe3cbfa9cbfed211a268e7c307232cbcc8705ef5b2c35bbd825d4",
     "sha256:8c25d059daf927573ab28a75b97611540bf6bddb151fceb4e38b29c9f8c3ba34"
    ]
   },
   {
    "name": "sha256:1ae91decb717658d1b7f11c9f809bb130ca95d4b63432a2526ee9d7e3d76f1a0",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:1ae91decb717658d1b7f11c9f809bb130ca95d4b63432a2526ee9d7e3d76f1a0",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
     "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
     "sha256:23ca1a413c368b88201ae1a3b404f8304f89141f755203a6105916eca083b15f",
     "sha256:059ad462c9cef0b2be3a12887c50178baf24311516171708b2cd3a3259596b4d"
    ]
   },
   {
    "name": "sha256:76432a36068b7d8a7572be30ea087914bf7407d09c594ba6f105a1219dc9fea2",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:76432a36068b7d8a7572be30ea087914bf7407d09c594ba6f105a1219dc9fea2",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
     "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
     "sha256:e0853528cf7a15b9abc6cd3bd091b95c28bfdcc3dadab9fbf21f1fe5bdddbe0a",
     "sha256:c59f889de84470b05859b2a22cbb101d8a8d8614061d710aee99b550b0b94b4c"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:84e379d6eef40ca05830c29fad2f2a5c15dd7158e9dd1277105e276413859144",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:84e379d6eef40ca05830c29fad2f2a5c15dd7158e9dd1277105e276413859144",
    "tagSymlink": "181d4462",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:daf64c7005798c8239ff3e6801f1d3c69ff563b6c95ac6e31ccdadbd4603350d",
     "sha256:1ae91decb717658d1b7f11c9f809bb130ca95d4b63432a2526ee9d7e3d76f1a0",
     "sha256:76432a36068b7d8a7572be30ea087914bf7407d09c594ba6f105a1219dc9fea2"
    ]
   },
   {
    "name": "sha256:682c8f8bb195c81a2022892b78ab6ce2619c69710638b74afe3f26c2dad28e64",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:682c8f8bb195c81a2022892b78ab6ce2619c69710638b74afe3f26c2dad28e64",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:ac3143d6092da265fe38fcde94e5aa790146bc14fc0580c8093e76bac041cda5",
     "sha256:ac66c0686cba60038ea36fc327219b74aa6990595d9fedbab70db5fd7ed202af",
     "sha256:328185e31f69efd5f81f03a7277d2ebcf4ccbef46d3945bf2b70c96bcb88a822"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:79c96fb77a37f46706dd156090ab39489975506bce3d01aa3852c5d90b4d4aec",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:79c96fb77a37f46706dd156090ab39489975506bce3d01aa3852c5d90b4d4aec",
    "tagSymlink": "bf20037c",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:50713e630f6e9d1e87dc7798c8360d1755c8160355ec2e17f362c45f13ef7648",
     "sha256:131b0e221d9f0ed99223a534333cc38fba234faeccff9c5d318623229b7b1ec6",
     "sha256:682c8f8bb195c81a2022892b78ab6ce2619c69710638b74afe3f26c2dad28e64"
    ]
   },
   {
    "name": "sha256:50713e630f6e9d1e87dc7798c8360d1755c8160355ec2e17f362c45f13ef7648",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:50713e630f6e9d1e87dc7798c8360d1755c8160355ec2e17f362c45f13ef7648",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:3d4679d6550ed04bed8f137eccb2f5198efb4491950ec50f15831eda1b6ad963",
     "sha256:a350b5699f9560463e065968d8c944145b6167eea7ab28e93085ae5dc891f4a4",
     "sha256:a788fdb7cd06df714c8379eb38da19ec7e829d51a2741d12cacfe83c56a12c9c"
    ]
   },
   {
    "name": "sha256:131b0e221d9f0ed99223a534333cc38fba234faeccff9c5d318623229b7b1ec6",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:131b0e221d9f0ed99223a534333cc38fba234faeccff9c5d318623229b7b1ec6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:abad6baafc4cb0a77e481dea4a8bc47a7ed5b5c944d494c18bfbec3aeba4e8cc",
     "sha256:e2487a2cb0100b0dd94bed09cab38bce7d663246ad31d602fe94948e4c5d659c",
     "sha256:76d0a4044d9697005358212c147d65346677c3010e917feb2c7ddd6d40d8c282"
    ]
   },
   {
    "name": "sha256:3ed79fb8475fa1ce34e9c1a974335663359e4d87e2050b7cf19d13bfdc392307",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:3ed79fb8475fa1ce34e9c1a974335663359e4d87e2050b7cf19d13bfdc392307",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
     "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
     "sha256:f36ce79926fa85f828a371348baa236d2826b7bf8d6cc741e88de3cda2b2aeae",
     "sha256:60ebe3bb2250f504aef5f6bc341aa131d0bb6e572a21bbed468440663b27385e"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-provisioner@sha256:60883fd78b799de9c8320c46263bd67fa4ed46ae8ce84fa3440fdd66a4c51355",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:60883fd78b799de9c8320c46263bd67fa4ed46ae8ce84fa3440fdd66a4c51355",
    "tagSymlink": "527e62aa",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:233832721f083c9d6b255c898da716579ca772b93589d40834672282303bbe63",
     "sha256:03ae0170819be645491dffc6db07797caba0aeefefcd9472af3bfacb07239319",
     "sha256:ee4a94686f3c3816d7152e0bcd67ae13e901c78a248d7499b5052e1f846776c6",
     "sha256:3ed79fb8475fa1ce34e9c1a974335663359e4d87e2050b7cf19d13bfdc392307"
    ]
   },
   {
    "name": "sha256:233832721f083c9d6b255c898da716579ca772b93589d40834672282303bbe63",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:233832721f083c9d6b255c898da716579ca772b93589d40834672282303bbe63",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
     "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
     "sha256:f503075cdb5ef12e2a81a9b7ea3d5e710323968ff435d8a71fcacbeddff337ad",
     "sha256:cae30fe4f08a365ff27c9e2ea089612ec88e4b422e1d8a8da568b63f958e7ce8"
    ]
   },
   {
    "name": "sha256:03ae0170819be645491dffc6db07797caba0aeefefcd9472af3bfacb07239319",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:03ae0170819be645491dffc6db07797caba0aeefefcd9472af3bfacb07239319",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
     "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
     "sha256:6eb3dc177c6b3d29303cdc3b6a0b17da4245027d62c46984a7e68b031cb35492",
     "sha256:90312accc86ecd9d94a15ac15c4e74a2c70cfc7e0d0be876634afc397bbc8e6e"
    ]
   },
   {
    "name": "sha256:ee4a94686f3c3816d7152e0bcd67ae13e901c78a248d7499b5052e1f846776c6",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:ee4a94686f3c3816d7152e0bcd67ae13e901c78a248d7499b5052e1f846776c6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
     "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
     "sha256:10c7f6255d16b74cc8b78e5dad12bfb39d20aabe7d21c572c4c2d3d8713a5b98",
     "sha256:283a23416e7e9c7fa303835091d20642c0dd2c2acb94326df39f8328988e9d6c"
    ]
   },
   {
    "name": "sha256:6fdfc98514441b8bdd1b6b0679fe36bbc10b8b0c6c4ef24826dff013f90ccfbe",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:6fdfc98514441b8bdd1b6b0679fe36bbc10b8b0c6c4ef24826dff013f90ccfbe",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
     "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
     "sha256:131b099b7937501890451e98e8358ca318a2d822b261e108300c25b83ae90094",
     "sha256:f6ab5ab2d32630d57a78c45d0c2db6349610e3445da2ce6e19040e34a5542148"
    ]
   },
   {
    "name": "sha256:96ecd8fb5af468a9bf8720bf98f2117e613afd9f247c9fabac6c76345c8ae121",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:96ecd8fb5af468a9bf8720bf98f2117e613afd9f247c9fabac6c76345c8ae121",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
     "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
     "sha256:53a9beae3fcb5a0217f7f73d71fde7db4f4dc8e8008835d511179217573dd65b",
     "sha256:bd42e4d1f7ec9d4f48b00e4a1548a0140c7832416307703adb0e0ff577877664"
    ]
   },
   {
    "name": "sha256:83fb4276de115ce25417a6900b507d78587f28c344dafa6d1f6bdd0e25d7b680",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:83fb4276de115ce25417a6900b507d78587f28c344dafa6d1f6bdd0e25d7b680",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
     "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
     "sha256:dcc3506d7f3a1f73044b29119978401137448e752156c4dc17653094cfb59489",
     "sha256:b19cbbd539107c95689d48d730677c23b6e007f247e3b7a4d646578d444662b3"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:20954f1fd9c2bac5cabaedbeec25d60b31546ffc05f3e4c38ffcf45e2ed41be9",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:20954f1fd9c2bac5cabaedbeec25d60b31546ffc05f3e4c38ffcf45e2ed41be9",
    "tagSymlink": "29f38640",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:08e8b4004edaeeb125ced09ab2c4cd6d690afaf3a86309c91a994dec8e3ccbf3",
     "sha256:6fdfc98514441b8bdd1b6b0679fe36bbc10b8b0c6c4ef24826dff013f90ccfbe",
     "sha256:96ecd8fb5af468a9bf8720bf98f2117e613afd9f247c9fabac6c76345c8ae121",
     "sha256:83fb4276de115ce25417a6900b507d78587f28c344dafa6d1f6bdd0e25d7b680"
    ]
   },
   {
    "name": "sha256:08e8b4004edaeeb125ced09ab2c4cd6d690afaf3a86309c91a994dec8e3ccbf3",
    "path": "openshift4/ose-kube-rbac-proxy",
    "id": "sha256:08e8b4004edaeeb125ced09ab2c4cd6d690afaf3a86309c91a994dec8e3ccbf3",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
     "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
     "sha256:78eb701467af757f6416a167e304b48e4f79584a06d77aabc31e3402e701432e",
     "sha256:55e294662f2c60c72271f4261f19b1be9c52515ffc76ba79f93bb44022fec181"
    ]
   },
   {
    "name": "sha256:04877f23ec28b278ef01bf80a7ed72e0bd7fc8bbf949afc77173e5b85cf1a4a3",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:04877f23ec28b278ef01bf80a7ed72e0bd7fc8bbf949afc77173e5b85cf1a4a3",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:1b890c73c3cf60b04334fded9e3edc647d64dd39ffd078317e2bd69552a2fd1d",
     "sha256:de63ba066b7c0c23e2434efebcda7800d50d60f33803af9c500f75a69fb76ffa",
     "sha256:b2a723a1165850255e84a64214f06e6adb9ff3f3290e0b35132313684af7b621",
     "sha256:744ccb82a0911da395dba3581dc5b278b98e45984b663c5ba97991dc778ab0d9",
     "sha256:8e2e3b99e9f8b557f0d581368e40ce72c145cc5595b3a080585b430753a6e2db"
    ]
   },
   {
    "name": "sha256:e78511467f01d4ebfab0661aba4f0fc1f26d7ce8ed197dd728b1111005d51e18",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:e78511467f01d4ebfab0661aba4f0fc1f26d7ce8ed197dd728b1111005d51e18",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:9f78280d50082c329e73123d73b3debc7f5eec007d8a0c7b1d388ff69b9652fc",
     "sha256:a1a64b9c0d1a2a468c65bf81fb26d51416a3e19d95d08df39e5d7d012a25b685",
     "sha256:f7109c3dbacb07ae738be8afb80c1d580757c61c03ec5e18ef2fa600b7823d26",
     "sha256:43a0fce968d1a7b1a451f4b0871488548538dd7d63b2131beb60bb4e7dc1faac",
     "sha256:7d59f905d8cf24a7c9374249eb8224a329ae0d132dee0e7e4e97bdc6a0cc8b67"
    ]
   },
   {
    "name": "sha256:cc79319542c17b694a4cd012631e6d7108195fd6aa44f51308cf176f7221814f",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:cc79319542c17b694a4cd012631e6d7108195fd6aa44f51308cf176f7221814f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4f639942cb5a04cfde9e90ad4590927d87ec970f46186ebe46182c2f0657584d",
     "sha256:261c17695cc21090e4719a05e282f024f0ab9a36997b3e3550ee7a97dee98668",
     "sha256:aa345f2f6695ebc5e00997e8487c157fd9669cc8cfcb7dfabe3b00bb7ae5a4f4",
     "sha256:759caabab663238cc4bb6da4aad63c00e19a0dc3ab5dd2f4f0f3e48296ce677c",
     "sha256:545da8f1e07f8a4f18e0f92960352f33663132fa335a99eb9c5bdef02e3e46b3"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:5db2f10f6a73ad0c3598e407ae2dba25bf4d0655d0c1b3c7fdab9802a44da796",
    "path": "odf4/cephcsi-rhel8",
    "id": "sha256:5db2f10f6a73ad0c3598e407ae2dba25bf4d0655d0c1b3c7fdab9802a44da796",
    "tagSymlink": "fc9cab52",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:04877f23ec28b278ef01bf80a7ed72e0bd7fc8bbf949afc77173e5b85cf1a4a3",
     "sha256:e78511467f01d4ebfab0661aba4f0fc1f26d7ce8ed197dd728b1111005d51e18",
     "sha256:cc79319542c17b694a4cd012631e6d7108195fd6aa44f51308cf176f7221814f"
    ]
   },
   {
    "name": "sha256:6745d0dc7aa04e1635293fc74237a791ff0f55714c3400e4861b6137dce1ff10",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:6745d0dc7aa04e1635293fc74237a791ff0f55714c3400e4861b6137dce1ff10",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:de4a1abf36a7aed82a349e791ad1249e0ff745680b92745c1e36d5ccecfe85cc",
     "sha256:e2e64ba5948c8fa2b9b67ec8fa375b6d8116617c497d2522f4afa63c9baa1d51"
    ]
   },
   {
    "name": "sha256:e0e828550c962af6769eb1a4956aece0091791992b87a5f89cddaefdb4297529",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:e0e828550c962af6769eb1a4956aece0091791992b87a5f89cddaefdb4297529",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:638e3d8b77f230d36759b82d44224b48862769e190246e072cbdae02c2e1017c",
     "sha256:0d9a0a8546468e7960464a85294ead7ebe830eb7bf6d3953461658bf53fe9a97"
    ]
   },
   {
    "name": "sha256:64d53c4049a60c7fc56241e7c7498ac7e17d7463a62a03580fa3580920f9acbe",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:64d53c4049a60c7fc56241e7c7498ac7e17d7463a62a03580fa3580920f9acbe",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:4043050bce8b2d6845d656dcb32574c51a70db583f2f2946576320586aa0a6af",
     "sha256:ce67e5b85cbbc5f09a023d1dd543a5197fb20ca62b0e6d5e34f3c7182f269a61"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:42c85dd18d7da2286a9a07602cf18abe578a93fa6ce4feeaffed1bbbdcbfa3de",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:42c85dd18d7da2286a9a07602cf18abe578a93fa6ce4feeaffed1bbbdcbfa3de",
    "tagSymlink": "bf1917f5",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:6745d0dc7aa04e1635293fc74237a791ff0f55714c3400e4861b6137dce1ff10",
     "sha256:e0e828550c962af6769eb1a4956aece0091791992b87a5f89cddaefdb4297529",
     "sha256:64d53c4049a60c7fc56241e7c7498ac7e17d7463a62a03580fa3580920f9acbe"
    ]
   },
   {
    "name": "sha256:7b58cd5003664544ee17bd05aca2bbe4cceb3c4bdcb622f384167ff7ede26034",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:7b58cd5003664544ee17bd05aca2bbe4cceb3c4bdcb622f384167ff7ede26034",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
     "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
     "sha256:0ca9810b9c1cb0e88ab35a882ae6db8efc00817399ac7ecd1ead19fd225bef94",
     "sha256:3632ed13e0c45964b9d20b94bd83a0e4d5d107b06671e4965b0329b741eee40f"
    ]
   },
   {
    "name": "sha256:d3db626c2cded2606c4db817b761de6fc4406f53a85404c3f3257e775ecadadf",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:d3db626c2cded2606c4db817b761de6fc4406f53a85404c3f3257e775ecadadf",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
     "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
     "sha256:5f13befa133daa413cd77e54f4bc4038d724e6f51221d27f024c95c39f2e6c8d",
     "sha256:b8ff07e9a2bacde97465bef9ede6b86f0994100a309d7eaf63e21a15d90c423e"
    ]
   },
   {
    "name": "sha256:596ec92d121ba820535052c65e26f4460a1f806cc9c161eae3502478839d8f96",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:596ec92d121ba820535052c65e26f4460a1f806cc9c161eae3502478839d8f96",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
     "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
     "sha256:c34d4b530fcb330bf9fc65eca112f33fcfad1e34ac2a7fad605c5c3eca7f6f75",
     "sha256:cacfd134e9509f6e3cc050b6cd389552094334dd5025be7db91a1d7a9a7a4df4"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:d9f60aed2f3fc928f5814c864f2cdb59f77bc0fa0a81c48f89c66870faccd570",
    "path": "odf4/odf-csi-addons-sidecar-rhel8",
    "id": "sha256:d9f60aed2f3fc928f5814c864f2cdb59f77bc0fa0a81c48f89c66870faccd570",
    "tagSymlink": "31c39cf0",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:7b58cd5003664544ee17bd05aca2bbe4cceb3c4bdcb622f384167ff7ede26034",
     "sha256:d3db626c2cded2606c4db817b761de6fc4406f53a85404c3f3257e775ecadadf",
     "sha256:596ec92d121ba820535052c65e26f4460a1f806cc9c161eae3502478839d8f96"
    ]
   },
   {
    "name": "sha256:2b428f848c3c30f7dd16cd4da4ebe975177d79584ae3f2ed1192cfe3114b6d5d",
    "path": "openshift4/ose-kubernetes-nmstate-handler-rhel8",
    "id": "sha256:2b428f848c3c30f7dd16cd4da4ebe975177d79584ae3f2ed1192cfe3114b6d5d",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
     "sha256:b56af1360c83e0a0479bf161b3ec392c8c513f8e8104700c8ed696fe4b261c8d",
     "sha256:15224fd656bf18db922883d875fd975ccd463b56a97a0e40b21b86f2dbdf0609",
     "sha256:2bf640e207dba4c5d5eaa001ee0dc60b958b5641a80f6b2fa82f3044650a90d1"
    ]
   },
   {
    "name": "sha256:fe88d68fc947c48ede58614099198fe6035b12ea5ff9a13ba14135626ed09929",
    "path": "openshift4/ose-kubernetes-nmstate-handler-rhel8",
    "id": "sha256:fe88d68fc947c48ede58614099198fe6035b12ea5ff9a13ba14135626ed09929",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
     "sha256:74f1fb7a06eab765809ca437e035b054dcfb1e6ecb3158ecc8a9076b6f26210f",
     "sha256:cbeff04a27e7830818307182fc7a07de87676ac607f3bdbf4db0c3625e584374",
     "sha256:8b3ba32b0f56efc902f878c204bbbc97136ba4b5eb57bdcf60ce0639b10efe5f"
    ]
   },
   {
    "name": "sha256:90e8ccd16ffcef352f39f29ebb947922f43dd199363ae6a14a64adabafc732db",
    "path": "openshift4/ose-kubernetes-nmstate-handler-rhel8",
    "id": "sha256:90e8ccd16ffcef352f39f29ebb947922f43dd199363ae6a14a64adabafc732db",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
     "sha256:9510f581bc6968bd3717fd248986be74458e606ee275a794d769df8d1e544640",
     "sha256:a70dbbf8b5d3c55e64ea8023460db2def80963b48ee26fde65958fe2f26fc4a9",
     "sha256:64c71b2b8ac5662b4e352e762e6f11957dc58a0574eb6221135386082578a170"
    ]
   },
   {
    "name": "sha256:24f00854dd5933569a69df2458eb49e18fab65988f25fa917ab8736d42bc9b96",
    "path": "openshift4/ose-kubernetes-nmstate-handler-rhel8",
    "id": "sha256:24f00854dd5933569a69df2458eb49e18fab65988f25fa917ab8736d42bc9b96",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
     "sha256:39504606388e1d44d94d8a1b2d37e37c80a5453590aaa0ec5b1c8b510a77750f",
     "sha256:64fa3d4acb710554e1b12035498c2599d6631de057c210ecee6f335a2b2f4c85",
     "sha256:3400dec63d69193601f03017df1b5a8a7c11dd25faa323777c4eb9f8598966f6"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-kubernetes-nmstate-handler-rhel8@sha256:de064d2fa68307da23438c52b04d5ba50fb22c906d986f6c7a240ebd3c251d00",
    "path": "openshift4/ose-kubernetes-nmstate-handler-rhel8",
    "id": "sha256:de064d2fa68307da23438c52b04d5ba50fb22c906d986f6c7a240ebd3c251d00",
    "tagSymlink": "f032d23e",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:2b428f848c3c30f7dd16cd4da4ebe975177d79584ae3f2ed1192cfe3114b6d5d",
     "sha256:fe88d68fc947c48ede58614099198fe6035b12ea5ff9a13ba14135626ed09929",
     "sha256:90e8ccd16ffcef352f39f29ebb947922f43dd199363ae6a14a64adabafc732db",
     "sha256:24f00854dd5933569a69df2458eb49e18fab65988f25fa917ab8736d42bc9b96"
    ]
   },
   {
    "name": "sha256:4759fc57394a11c41dded658a7f2f25e94bdd94bd90ba8982a6686f3655127c5",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:4759fc57394a11c41dded658a7f2f25e94bdd94bd90ba8982a6686f3655127c5",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:1b890c73c3cf60b04334fded9e3edc647d64dd39ffd078317e2bd69552a2fd1d",
     "sha256:de63ba066b7c0c23e2434efebcda7800d50d60f33803af9c500f75a69fb76ffa",
     "sha256:02de04c0febbf7309be67ca2d44f57a2294768575ddfe1e48577205d845dc54f",
     "sha256:0b8d99d840c36a7c52baabad5efcd4986288428791f9f9241b773ee20e9f5ec7"
    ]
   },
   {
    "name": "sha256:50e637f68e41af76209c4a5064dc6da951138d3024a25b0c8f3a709447399eaa",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:50e637f68e41af76209c4a5064dc6da951138d3024a25b0c8f3a709447399eaa",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:9f78280d50082c329e73123d73b3debc7f5eec007d8a0c7b1d388ff69b9652fc",
     "sha256:a1a64b9c0d1a2a468c65bf81fb26d51416a3e19d95d08df39e5d7d012a25b685",
     "sha256:183f42867768c71e75d3d5fc950dccb97c96c135cde9ce2c4f2719a52ff7312c",
     "sha256:7d0bd64603531dc2d88fa6ec17fc1d05e81764f1db6c7e908dfa4dd3d8c97c7a"
    ]
   },
   {
    "name": "sha256:1f6a4f64c65084bb8257428d6ab58d0f04aae9362dc3f3c84e4988d89a237678",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:1f6a4f64c65084bb8257428d6ab58d0f04aae9362dc3f3c84e4988d89a237678",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4f639942cb5a04cfde9e90ad4590927d87ec970f46186ebe46182c2f0657584d",
     "sha256:261c17695cc21090e4719a05e282f024f0ab9a36997b3e3550ee7a97dee98668",
     "sha256:09f2ff47c9a30c87d03a4223fddf2796e0fd9764dfe0e5d8465d4676a7912064",
     "sha256:f652f0de9fead918f5702efeb672d6e44e774afd85436258f2d68569f6c6a50e"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:e2e9a3697dd3cf8ae1030eadf840a7e946131f11605e4d3fc46be27e0d1bf417",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:e2e9a3697dd3cf8ae1030eadf840a7e946131f11605e4d3fc46be27e0d1bf417",
    "tagSymlink": "748701b1",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:4759fc57394a11c41dded658a7f2f25e94bdd94bd90ba8982a6686f3655127c5",
     "sha256:50e637f68e41af76209c4a5064dc6da951138d3024a25b0c8f3a709447399eaa",
     "sha256:1f6a4f64c65084bb8257428d6ab58d0f04aae9362dc3f3c84e4988d89a237678"
    ]
   },
   {
    "name": "sha256:7b352c6705f3b8604c3fceecc825bcb5d78b185211ea4a9bb9741f1878eed963",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:7b352c6705f3b8604c3fceecc825bcb5d78b185211ea4a9bb9741f1878eed963",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0c673eb68f88b60abc0cba5ef8ddb9c256eaf627bfd49eb7e09a2369bb2e5db0",
     "sha256:028bdc977650c08fcf7a2bb4a7abefaead71ff8a84a55ed5940b6dbc7e466045",
     "sha256:6c97fa2291463eee9a225acd21f6c5d544134176fcfac43f61e614362d22443c",
     "sha256:38df80357e025638dd2bd39c40a89d336a38531842e23ed50ea41b63d7657bad"
    ]
   },
   {
    "name": "sha256:7d18d513f660417cc5b676f495ac1889ef356ac2afaaabfcf95ccbc0e952077c",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:7d18d513f660417cc5b676f495ac1889ef356ac2afaaabfcf95ccbc0e952077c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:7472fa517fd188919c3ff6ec27806dd20311bb57e1e34a7f3998734688fa7b42",
     "sha256:9f6eca53e5bceb7b88b4c078cc5d939e61d13301d8bdccb6b68eeea4d3879f3e",
     "sha256:73010716aec388bfab246441a45859a9378389d40c848654a75ab6d985f524aa",
     "sha256:a61be58981ba4e5381602db60afbae7a456d81545eeed03a0f41cdb49dc6405e"
    ]
   },
   {
    "name": "sha256:a4a0e2ffaa192739b746a2f678ccf6a8133a96fd34ad5186d14499ab3f98fbf9",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:a4a0e2ffaa192739b746a2f678ccf6a8133a96fd34ad5186d14499ab3f98fbf9",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:744db8e918c5c882f601488dcdbe3c4e9fa01913fe57119975eb5b16a18f6250",
     "sha256:d851aca55b090483dcda2af05dbf048848399647d96dd3d4089f92d35f827db7",
     "sha256:ca41f6878aa10e808b14ddb5c7a4dd8233fab5d659bb89cebe41d3924941bf80",
     "sha256:1aeeb8c532c31e4aa2e825ee1ac1a4d597bb4cbe7b580c90cf9c4093d0c16ee0"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:512e708ecb13c608430a5edd11fd2c52a47bebed33851d7aa80ef35003a15076",
    "path": "odf4/mcg-core-rhel8",
    "id": "sha256:512e708ecb13c608430a5edd11fd2c52a47bebed33851d7aa80ef35003a15076",
    "tagSymlink": "2a458219",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:7b352c6705f3b8604c3fceecc825bcb5d78b185211ea4a9bb9741f1878eed963",
     "sha256:7d18d513f660417cc5b676f495ac1889ef356ac2afaaabfcf95ccbc0e952077c",
     "sha256:a4a0e2ffaa192739b746a2f678ccf6a8133a96fd34ad5186d14499ab3f98fbf9"
    ]
   },
   {
    "name": "sha256:7c2a9e94cd13643b156316d5068e521f106b315ff8361b3fca21d84a3476934e",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:7c2a9e94cd13643b156316d5068e521f106b315ff8361b3fca21d84a3476934e",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
     "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
     "sha256:620cc9f36a9fcff0621b3719f1f795e60ea38de7c35579d0eb2d8a0c290a80f7",
     "sha256:b7f5109279cec62eb4193b7d7770c13e8edac1c3ea37ac8ef3fbe4e655cd5fbf"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-rhel8-operator@sha256:83b24d46f98858fd9d7a7545f4e1b0bdd810b3e4c615ec6f8d46a51bf5ab003a",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:83b24d46f98858fd9d7a7545f4e1b0bdd810b3e4c615ec6f8d46a51bf5ab003a",
    "tagSymlink": "dd284910",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:82d7fb62915688a32d3828cf1cd37849e3423c10e9266a4b3ab023167ffcc8c3",
     "sha256:bcb4b67588a5c922be7a50814b640b6284a0a546b193bfc57f7e3e814ab37872",
     "sha256:7c2a9e94cd13643b156316d5068e521f106b315ff8361b3fca21d84a3476934e"
    ]
   },
   {
    "name": "sha256:82d7fb62915688a32d3828cf1cd37849e3423c10e9266a4b3ab023167ffcc8c3",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:82d7fb62915688a32d3828cf1cd37849e3423c10e9266a4b3ab023167ffcc8c3",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
     "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
     "sha256:dee10834884ded7d21b6f6e4d591ff4d47d42be4f98c19887703938bc8171ac1",
     "sha256:563599c23ff3876dc641b0af00b428072ed519178d3b133679c76d18d8e7233b"
    ]
   },
   {
    "name": "sha256:bcb4b67588a5c922be7a50814b640b6284a0a546b193bfc57f7e3e814ab37872",
    "path": "odf4/odf-csi-addons-rhel8-operator",
    "id": "sha256:bcb4b67588a5c922be7a50814b640b6284a0a546b193bfc57f7e3e814ab37872",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
     "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
     "sha256:063b793e626151664cfda0e4f13be084fda911e98a5413e03e93e42cba1567a0",
     "sha256:5fce155794cea8fc14ac25e5d8b7e3375da2aa83099523d3da91750f072a6c68"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-provisioner@sha256:42563eb25efb2b6f277944b627bea420fa58fe950b46a1bd1487122b8a387e75",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:42563eb25efb2b6f277944b627bea420fa58fe950b46a1bd1487122b8a387e75",
    "tagSymlink": "495ed5c4",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:ca4f156e26c892fd998bda5145aab16cdccc31d64e6d30fb983425562d344fb6",
     "sha256:e540dd147f8ed981e8b2ebb3142e0004f5fcb0b9ed57408d600835e96ff7b459",
     "sha256:d879c3de3949af528c56d3af7d2747b5195d1660d4877ea8eeac1c04afe7e99f",
     "sha256:b0e47366feb0add960cf6891f762bc5019853107321ba6132afd86a63a85adc9"
    ]
   },
   {
    "name": "sha256:ca4f156e26c892fd998bda5145aab16cdccc31d64e6d30fb983425562d344fb6",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:ca4f156e26c892fd998bda5145aab16cdccc31d64e6d30fb983425562d344fb6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
     "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
     "sha256:f3c0967afe0ac69e5b13dadafceaef548f3ac0f782c378e996554301f2f5f7b5",
     "sha256:f4f57fec63a30587f779277f6887bf096dac5ba07da123d2b1d781e78f853353"
    ]
   },
   {
    "name": "sha256:e540dd147f8ed981e8b2ebb3142e0004f5fcb0b9ed57408d600835e96ff7b459",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:e540dd147f8ed981e8b2ebb3142e0004f5fcb0b9ed57408d600835e96ff7b459",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
     "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
     "sha256:2b29a07b4ba818835b1d318faa9cbd05e8e8202ae1aea563cd37f2a2be2dc981",
     "sha256:8e23c4c458df809b75c2a5b1bc2c38668e094a191297392f6b6f73dbc032b634"
    ]
   },
   {
    "name": "sha256:d879c3de3949af528c56d3af7d2747b5195d1660d4877ea8eeac1c04afe7e99f",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:d879c3de3949af528c56d3af7d2747b5195d1660d4877ea8eeac1c04afe7e99f",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
     "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
     "sha256:ebfe24ce1315918690dcaa33d9547db2388f03b2de2b09172f9442b97f1e1adf",
     "sha256:bcf47465daf8023bbac6b9960a950b0026c3653fd223f78b484b5077d1402145"
    ]
   },
   {
    "name": "sha256:b0e47366feb0add960cf6891f762bc5019853107321ba6132afd86a63a85adc9",
    "path": "openshift4/ose-csi-external-provisioner",
    "id": "sha256:b0e47366feb0add960cf6891f762bc5019853107321ba6132afd86a63a85adc9",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
     "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
     "sha256:bb543b09c739670ee0dfe60fdccbf849b7c2aadf58da97395d0c4ad817115356",
     "sha256:eefcae4d83fe669a491ea72134686473821119836edd2cbeccdf85a7b447f6f3"
    ]
   },
   {
    "name": "sha256:a500ebe5a174a9fb1888866ece82a76c5f586fa058a045315aaa4e8943e10573",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:a500ebe5a174a9fb1888866ece82a76c5f586fa058a045315aaa4e8943e10573",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:9f78280d50082c329e73123d73b3debc7f5eec007d8a0c7b1d388ff69b9652fc",
     "sha256:a1a64b9c0d1a2a468c65bf81fb26d51416a3e19d95d08df39e5d7d012a25b685",
     "sha256:f7109c3dbacb07ae738be8afb80c1d580757c61c03ec5e18ef2fa600b7823d26",
     "sha256:22e7d2b52122cbb2c8b1a4374d1b7d71d1d34b603a58983de0dc0539b6625ed6"
    ]
   },
   {
    "name": "sha256:abeb1f371d18b55380ef5661fbf86dde78f7b84da41516feff679866c8164d6c",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:abeb1f371d18b55380ef5661fbf86dde78f7b84da41516feff679866c8164d6c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4f639942cb5a04cfde9e90ad4590927d87ec970f46186ebe46182c2f0657584d",
     "sha256:261c17695cc21090e4719a05e282f024f0ab9a36997b3e3550ee7a97dee98668",
     "sha256:aa345f2f6695ebc5e00997e8487c157fd9669cc8cfcb7dfabe3b00bb7ae5a4f4",
     "sha256:872387e48a2788b3053afda8a95fe6469435091b2182e6ef1d59c7e6c50b01cf"
    ]
   },
   {
    "name": "registry.redhat.io/rhceph/rhceph-5-rhel8@sha256:fc25524ccb0ea78526257778ab54bfb1a25772b75fcc97df98eb06a0e67e1bf6",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:fc25524ccb0ea78526257778ab54bfb1a25772b75fcc97df98eb06a0e67e1bf6",
    "tagSymlink": "940f0024",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:06255c43a5ccaec516969637a39d500a0354da26127779b5ee53dbe9c444339c",
     "sha256:a500ebe5a174a9fb1888866ece82a76c5f586fa058a045315aaa4e8943e10573",
     "sha256:abeb1f371d18b55380ef5661fbf86dde78f7b84da41516feff679866c8164d6c"
    ]
   },
   {
    "name": "sha256:06255c43a5ccaec516969637a39d500a0354da26127779b5ee53dbe9c444339c",
    "path": "rhceph/rhceph-5-rhel8",
    "id": "sha256:06255c43a5ccaec516969637a39d500a0354da26127779b5ee53dbe9c444339c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:1b890c73c3cf60b04334fded9e3edc647d64dd39ffd078317e2bd69552a2fd1d",
     "sha256:de63ba066b7c0c23e2434efebcda7800d50d60f33803af9c500f75a69fb76ffa",
     "sha256:b2a723a1165850255e84a64214f06e6adb9ff3f3290e0b35132313684af7b621",
     "sha256:a4eb511aa22b894560dd7f213a67563962331bf38dae266b877de5640db79838"
    ]
   },
   {
    "name": "sha256:7b29706a171532218b07b5de5fe5d6470c5064a3317116a35fc3587af133b5ff",
    "path": "openshift4/kubernetes-nmstate-rhel8-operator",
    "id": "sha256:7b29706a171532218b07b5de5fe5d6470c5064a3317116a35fc3587af133b5ff",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
     "sha256:b56af1360c83e0a0479bf161b3ec392c8c513f8e8104700c8ed696fe4b261c8d",
     "sha256:a14ea5d92d3bde28fdb2217430366523f3c432d6b26c54be4405adffe70c4193",
     "sha256:29de1d58b14e4d13c1c5ea45db530da00e07368da4a85d02305857796228b2b4"
    ]
   },
   {
    "name": "sha256:c26e7ecb2b856914ea8582e225b0b10a940c84cb91502492f8e59172525fdca9",
    "path": "openshift4/kubernetes-nmstate-rhel8-operator",
    "id": "sha256:c26e7ecb2b856914ea8582e225b0b10a940c84cb91502492f8e59172525fdca9",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
     "sha256:74f1fb7a06eab765809ca437e035b054dcfb1e6ecb3158ecc8a9076b6f26210f",
     "sha256:2d42c3d2dc6d9db72456998cef579018c22932c2ed0752706ccf9110b0721090",
     "sha256:6399fe015b69f635349cc8d843ce90682a94aa1178b677d03ccc4eacdbed167e"
    ]
   },
   {
    "name": "sha256:40544856b520307617f6b45787beca29e8f7f03a10d72128867b9c471ccd9cad",
    "path": "openshift4/kubernetes-nmstate-rhel8-operator",
    "id": "sha256:40544856b520307617f6b45787beca29e8f7f03a10d72128867b9c471ccd9cad",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
     "sha256:9510f581bc6968bd3717fd248986be74458e606ee275a794d769df8d1e544640",
     "sha256:4532282f4c82ed8e9dda0f817a784b5f81faf0dc1b0d1a2c732fd4ca22d99dfa",
     "sha256:91d5050a10c223cb44c4d3de687f7ed700471d8131a612e9477385e092f1b649"
    ]
   },
   {
    "name": "sha256:7450966bf250b2f624979a21ecc4663bfe29b29c61ae23a0b43bcdd9e5c4a759",
    "path": "openshift4/kubernetes-nmstate-rhel8-operator",
    "id": "sha256:7450966bf250b2f624979a21ecc4663bfe29b29c61ae23a0b43bcdd9e5c4a759",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
     "sha256:39504606388e1d44d94d8a1b2d37e37c80a5453590aaa0ec5b1c8b510a77750f",
     "sha256:bfe71d33d0cf5feeaa9c7a4a517230ba421ce9e697c41998e377a18e27a29760",
     "sha256:1b9cd96f42f7a7d4203860e4059a24759fb54592d4182fb115253e0f596fd8b4"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/kubernetes-nmstate-rhel8-operator@sha256:5cc328a8ae414ef603ed9667ae10a85ae7bda12f2bb1404c80771245504eeab6",
    "path": "openshift4/kubernetes-nmstate-rhel8-operator",
    "id": "sha256:5cc328a8ae414ef603ed9667ae10a85ae7bda12f2bb1404c80771245504eeab6",
    "tagSymlink": "b66c5da8",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:7b29706a171532218b07b5de5fe5d6470c5064a3317116a35fc3587af133b5ff",
     "sha256:c26e7ecb2b856914ea8582e225b0b10a940c84cb91502492f8e59172525fdca9",
     "sha256:40544856b520307617f6b45787beca29e8f7f03a10d72128867b9c471ccd9cad",
     "sha256:7450966bf250b2f624979a21ecc4663bfe29b29c61ae23a0b43bcdd9e5c4a759"
    ]
   },
   {
    "name": "sha256:1ec2ea55d1f56012b9a377a223289fedc9f41f9808e2242cdb2c677ad0594f7e",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:1ec2ea55d1f56012b9a377a223289fedc9f41f9808e2242cdb2c677ad0594f7e",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
     "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
     "sha256:7e04dd2fac6a4e1be66f1c90337446c9dad3daa1cdeedcab174144ccf672a433",
     "sha256:1a0db6f18829ea8c73d65dba5323f3a533a0a01c1ba9aefb6ad6f604fe970fe0"
    ]
   },
   {
    "name": "sha256:0d5449cd9554cffa8f9ad57f59782462432138b95c81f407f5fb14095892fb84",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:0d5449cd9554cffa8f9ad57f59782462432138b95c81f407f5fb14095892fb84",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
     "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
     "sha256:5f16b6cef155e9af91edf621a7426bd3def8eff638c4638469793f5809c916a3",
     "sha256:33c01a77ba98b7920df9a756f6105b26c1b603a5a79455df4c5bf2ae13d018d2"
    ]
   },
   {
    "name": "sha256:39f23d00e86e0493045e1514febd943a728ae23ad60f32c6b234816fa3a11aa6",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:39f23d00e86e0493045e1514febd943a728ae23ad60f32c6b234816fa3a11aa6",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
     "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
     "sha256:e2f74835a7c4ed1637142d9428e017c24b493f7b6f5885097fb493f2ceb0ff19",
     "sha256:b4b26d17441526d034dff72f2858fae58d78742267924efce6bb2ec61c255bfa"
    ]
   },
   {
    "name": "sha256:40c814736c53fca7d22a85ba0eb52c5c27f861926534349ec53ee2e090fbcc7e",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:40c814736c53fca7d22a85ba0eb52c5c27f861926534349ec53ee2e090fbcc7e",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
     "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
     "sha256:7126833b4cf18e5dee4f8cc42781cab7d6a61ad1a608a731704014de37063472",
     "sha256:e3c306cfc117a2dbbe8621dcdb53e2da8ec1cd6e9acdf647f6d42edd4d29ea94"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-attacher@sha256:7840134d92c918aa3e80f93d24630566be07b3afc16515d5525217e554e8f35d",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:7840134d92c918aa3e80f93d24630566be07b3afc16515d5525217e554e8f35d",
    "tagSymlink": "d0755c38",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:1ec2ea55d1f56012b9a377a223289fedc9f41f9808e2242cdb2c677ad0594f7e",
     "sha256:0d5449cd9554cffa8f9ad57f59782462432138b95c81f407f5fb14095892fb84",
     "sha256:39f23d00e86e0493045e1514febd943a728ae23ad60f32c6b234816fa3a11aa6",
     "sha256:40c814736c53fca7d22a85ba0eb52c5c27f861926534349ec53ee2e090fbcc7e"
    ]
   },
   {
    "name": "sha256:cd6c27bd6aa0b13fac3f10f4002940f4df7ee43abcacfc5235bee31d0eecf391",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:cd6c27bd6aa0b13fac3f10f4002940f4df7ee43abcacfc5235bee31d0eecf391",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:0a21bb5475ea5fbcfdeab2bbe08a1cf4ef0b55382d553d2c213620763078223c",
     "sha256:38dd71adcfc1f964c6f3ba6ae3b6daa95f612681cfb05298b225bb6347942f56",
     "sha256:ea3cc532485d33cde86334ac280e39af74db84044aa10d44ebb83b8322a9aa8b",
     "sha256:7407b3e1760a358f888f414c169426c852b96ab839559f634ad4c682125ae475"
    ]
   },
   {
    "name": "sha256:c61b935f9d32eff217953e3d5d1e61416830c679cd6486f525ecd60ab8fcb631",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:c61b935f9d32eff217953e3d5d1e61416830c679cd6486f525ecd60ab8fcb631",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3abc8c0d3d4265b5efb17447cd4a399fc70858b08d7cd5dce88dca7a09bc089",
     "sha256:ada7e11fb107d011a3b016cc659ca3f138f11725949328d92d3714ac15ef4ce2",
     "sha256:ae30dac98739aae4aaea001188a0a315b0781f64ac79c23d4cf9bc89485df5d7",
     "sha256:8bc77ee07a89d70808e193a86cf5d506c77350a9ab6d232b36e2071b3a363c5b"
    ]
   },
   {
    "name": "sha256:68a8c03c7db768e1992b2d92b661f9d30604d7db6d51e0a15b4560f1e80c5402",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:68a8c03c7db768e1992b2d92b661f9d30604d7db6d51e0a15b4560f1e80c5402",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:92559d5f5a908101d2776f8e756d73806b2bd3354be51e12d3111c90a4f09b07",
     "sha256:083e3eac55c875258c6477c979a400f62751e489a5aa9ffbbf0bf0bfdf773bcf",
     "sha256:e0a52ce59f7192f89c2cbe76854508a23c17fbe4abc14b95dd35a3e4d72e2d01",
     "sha256:853713a4b8af5fc97fd49da08aacd56f8d8ec9ed580ce1e7afe5c91c7386ed20"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:83fa1802f532c4c17aebe2fecdc4a49a6308efa12b1e03c62c527ae5a8ce261d",
    "path": "odf4/ocs-must-gather-rhel8",
    "id": "sha256:83fa1802f532c4c17aebe2fecdc4a49a6308efa12b1e03c62c527ae5a8ce261d",
    "tagSymlink": "6bcbcdb3",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:cd6c27bd6aa0b13fac3f10f4002940f4df7ee43abcacfc5235bee31d0eecf391",
     "sha256:c61b935f9d32eff217953e3d5d1e61416830c679cd6486f525ecd60ab8fcb631",
     "sha256:68a8c03c7db768e1992b2d92b661f9d30604d7db6d51e0a15b4560f1e80c5402"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-csi-addons-operator-bundle@sha256:33d5a81a5f78a4a63c1fd4c7bad0b0ec82beef5b847025ae1d097248a59705d2",
    "path": "odf4/odf-csi-addons-operator-bundle",
    "id": "sha256:33d5a81a5f78a4a63c1fd4c7bad0b0ec82beef5b847025ae1d097248a59705d2",
    "tagSymlink": "fbc9d4f0",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:563b783fc33a73c2714ee20950f3642df05857c9292ab2a628b0bcd3a8a6fb2d",
     "sha256:c5e05b4c674a494caaa603fc6e97359297dfe94f8e7d61b68d79ca4e3ae423e4"
    ]
   },
   {
    "name": "sha256:469c9af9ee4cd125d8d30328bef5f962c243c143fba7715564f1bb2078d5ceca",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:469c9af9ee4cd125d8d30328bef5f962c243c143fba7715564f1bb2078d5ceca",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
     "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
     "sha256:af5458290b9eb5772f0935e6dca7d35a4b75ec3a8117aa664029b0c4cce4f51e",
     "sha256:f420bcd3aab1588a94555413993a363e00f450b2e22c5588b66aa86f2deef949",
     "sha256:925a9243259e1e369b9b0bf23949aad4c8cd2d79ae503bc8819acc42f8ebeae6",
     "sha256:a9ddeb96198e0639716aee4de67367640f4385d3968a0985b063d93fb854b0d0"
    ]
   },
   {
    "name": "sha256:8aa38717914b054cfcf2f0de1d6d6320d08fc828291e081c80a499c7708e2359",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:8aa38717914b054cfcf2f0de1d6d6320d08fc828291e081c80a499c7708e2359",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
     "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
     "sha256:633d8934e21d60dccb5c55df7a62f24f6ee0518f233c4b1948757a264269fb8a",
     "sha256:e1ca9215c6cc1a10f2973923cc30be793ac2087be96496e6d216e625341bcedf",
     "sha256:bd1019b57805ff5fb92b78b21e798fd26c1d00842483105d41fbab71f098bbb7",
     "sha256:8fe53d246eb2dfd59754492698afa72ac93379f467bc3f6762aa3b84569111f7"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:031c6e5327bcf765773b6326287e9ac86a616a0833c8daf6c4c22a271e47b8a0",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:031c6e5327bcf765773b6326287e9ac86a616a0833c8daf6c4c22a271e47b8a0",
    "tagSymlink": "58a09723",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:2c3a707f2634be16582aa3e66663ed47d44147620cc5c2ee25f0c60aa2a8e3f8",
     "sha256:469c9af9ee4cd125d8d30328bef5f962c243c143fba7715564f1bb2078d5ceca",
     "sha256:8aa38717914b054cfcf2f0de1d6d6320d08fc828291e081c80a499c7708e2359"
    ]
   },
   {
    "name": "sha256:2c3a707f2634be16582aa3e66663ed47d44147620cc5c2ee25f0c60aa2a8e3f8",
    "path": "odf4/odf-console-rhel8",
    "id": "sha256:2c3a707f2634be16582aa3e66663ed47d44147620cc5c2ee25f0c60aa2a8e3f8",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
     "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
     "sha256:399eb2b7226e96b12325f0470a572b98e868286c4e7568f7623d863ae36fbe02",
     "sha256:65433b15516432f60f7099880a817b2573f45c98b31a8db77afaa31131870bb8",
     "sha256:d57d43cd9eea3773cbcf20561df915128a3b3d39d4ecc4642dcceb44d01cbe6f",
     "sha256:9f75a06011de4915beb37861c8fbdaf713e1c346e544fd1ebd7f4c284b2f68bb"
    ]
   },
   {
    "name": "sha256:f9b48b50629360b06cc8f88df99ae61e0f02fe7ba69f66ee03d2a66be670abc4",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:f9b48b50629360b06cc8f88df99ae61e0f02fe7ba69f66ee03d2a66be670abc4",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:d3b9a4a690bf1791b874c3495c6a8e2c039150b5882374cd9c42dd4bba68ba31",
     "sha256:a049ed70eeb87542c711449e14b6a7ccdde9ca2219d749fa0872aa755f2a89cb",
     "sha256:c0ee94b4891b36be832181adf5d8936a872f4dc74bf72fac37d5e114d8ac485e",
     "sha256:8c69d5f8e0bbf1d8b190068264e4a9ba1ad83c991b5965eb864a5a0283cf3064"
    ]
   },
   {
    "name": "sha256:320f0b0cabb980087c9946ce8c95a49e5966019f723a5f1831f3b65248635243",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:320f0b0cabb980087c9946ce8c95a49e5966019f723a5f1831f3b65248635243",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:02863a09124c1837ee0672a011fb7e2d5c95ae16af6b569f65d2e0f763127ddc",
     "sha256:97aead8e17dadf7e07e5153ee6d5a68d28e46847e01db6d9325742076043fd20",
     "sha256:f49354925a1061f031d15638d46b605b3905052809368b582847a68ed5e38ac2",
     "sha256:6d4fb2b180a5293b3bd4740b4d9a52d2f33af400bf694ddc09f98ce8238afd92"
    ]
   },
   {
    "name": "sha256:463ffc78557e0076dd37cc20ccad7948e76170b5632b8119c0a0b213285f36b0",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:463ffc78557e0076dd37cc20ccad7948e76170b5632b8119c0a0b213285f36b0",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:220d447748c8866cbfeac8fb3534dd8d49cc8b99cc625041414c17d0f80e02ca",
     "sha256:8909629d32e7d0fef085a5fcee0e0f318367006d81be0d5da8e0a209ee230793",
     "sha256:eee40947b182151b0af58856842ae7482231cf6f68a4dae90fc93e74d6276f63",
     "sha256:63190a8992c6286f99eef36b74cc1b6310002166e23b460fc7d18a251380b70f"
    ]
   },
   {
    "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:d15076109b87ebfbca4dad174d5cdc46d6f1c911cfc8fea3fe6d743bc1891847",
    "path": "odf4/volume-replication-rhel8-operator",
    "id": "sha256:d15076109b87ebfbca4dad174d5cdc46d6f1c911cfc8fea3fe6d743bc1891847",
    "tagSymlink": "70d22a83",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:f9b48b50629360b06cc8f88df99ae61e0f02fe7ba69f66ee03d2a66be670abc4",
     "sha256:320f0b0cabb980087c9946ce8c95a49e5966019f723a5f1831f3b65248635243",
     "sha256:463ffc78557e0076dd37cc20ccad7948e76170b5632b8119c0a0b213285f36b0"
    ]
   },
   {
    "name": "sha256:0dcb115c44c0436ae63d5fe8d8b97c3e8c05b5698f19e13062306c43425ab55c",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:0dcb115c44c0436ae63d5fe8d8b97c3e8c05b5698f19e13062306c43425ab55c",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
     "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
     "sha256:ed56fdd98f16b922b32fcb6ce609abcf8f70d5968db9dadf4c8ccabf9f388395",
     "sha256:967e8ab8765664c6a1352cdb227a8b1703349bd922f50842fa50b500ceb5f6ac"
    ]
   },
   {
    "name": "sha256:734b0117da2be59627b732b119a0726bb9208779b9ecb77e94bb4656d5dfe1ee",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:734b0117da2be59627b732b119a0726bb9208779b9ecb77e94bb4656d5dfe1ee",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
     "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
     "sha256:14f15a66b96e4129cafaf3b9819c3b377bf3e5ce56d8aa00f909cd9f6931bacf",
     "sha256:b547b35a6955eda95987a9626ee0746e605463c4f94575aa2d7adfb3750076c4"
    ]
   },
   {
    "name": "sha256:345e5c9f20d392840131bbb5513d96011d48a9cde091495cb3bb6912032ac3ce",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:345e5c9f20d392840131bbb5513d96011d48a9cde091495cb3bb6912032ac3ce",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
     "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
     "sha256:d7045eae6268136660f80f241fb798547af2f9882c05b74c9e0daf923699ca3c",
     "sha256:ade93b476890fc97e5fe4f32a051159854f0e2a0bc51e3f31cea1574fd0d2bfb"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-snapshotter@sha256:8aba608ee3fcca4a1e0cef679fd61778cc071a91871bb6146eb46b38bae22260",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:8aba608ee3fcca4a1e0cef679fd61778cc071a91871bb6146eb46b38bae22260",
    "tagSymlink": "61ad6590",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:69bcfc204958769d7ca0c7d239e3f9b4ae13c55f6de969006bbdd62c11554de5",
     "sha256:0dcb115c44c0436ae63d5fe8d8b97c3e8c05b5698f19e13062306c43425ab55c",
     "sha256:734b0117da2be59627b732b119a0726bb9208779b9ecb77e94bb4656d5dfe1ee",
     "sha256:345e5c9f20d392840131bbb5513d96011d48a9cde091495cb3bb6912032ac3ce"
    ]
   },
   {
    "name": "sha256:69bcfc204958769d7ca0c7d239e3f9b4ae13c55f6de969006bbdd62c11554de5",
    "path": "openshift4/ose-csi-external-snapshotter",
    "id": "sha256:69bcfc204958769d7ca0c7d239e3f9b4ae13c55f6de969006bbdd62c11554de5",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
     "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
     "sha256:edeb746e57a257eab7cf3823293cf3954610a0a921421fc7e3569fce5bcbd4ca",
     "sha256:bd8f0f0bf06cb7bb66e1104c07ba3cb2d01d5aaa5e378f7c9b83bca4a92b7002"
    ]
   },
   {
    "name": "sha256:5a25a26071fa9bc47fc225a7094c5766d2b5ba5672f50fef74b6ca42386d08c9",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:5a25a26071fa9bc47fc225a7094c5766d2b5ba5672f50fef74b6ca42386d08c9",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
     "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
     "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
     "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
     "sha256:6d7baa693c3895cad8350e338f5cc9430ce326532db5fa8a98e1cdb8901c0b67",
     "sha256:3f0277141d7795bd46918ca38eae4fa12dea1837ac42bc356b8deecb4efc0631"
    ]
   },
   {
    "name": "sha256:7c7cded451ce5a9af3126e7f7cd85824c3272a734214c7d14340264ba5e9b342",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:7c7cded451ce5a9af3126e7f7cd85824c3272a734214c7d14340264ba5e9b342",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
     "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
     "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
     "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
     "sha256:696fb007438d9d637a3bb393b77977c4c1676861fe4f2cc66bf76705f337b8ff",
     "sha256:4559af5adfad4252fd9da4de7da41b00169750ca6797cbbebfb1f62a44a3afa0"
    ]
   },
   {
    "name": "sha256:05816da29dd5410e32fbb0f1fae27961efa2ac5f166fcf355b5f5e3beb584e54",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:05816da29dd5410e32fbb0f1fae27961efa2ac5f166fcf355b5f5e3beb584e54",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
     "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
     "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
     "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
     "sha256:64ea5da000168bda49627e21402d3267112ad8bd59c962033a4f01dc665ba4aa",
     "sha256:641f32d3d2370739400c16d06e703704f0318cce31348f96ef727fcb219b77ee"
    ]
   },
   {
    "name": "sha256:112fa4f0f8a5760f1cd8891d53621a3ea3e7074fb923916e730dbb9848e2d5bb",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:112fa4f0f8a5760f1cd8891d53621a3ea3e7074fb923916e730dbb9848e2d5bb",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
     "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
     "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
     "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
     "sha256:bedae5874309518121a9cf7450f87b7ba9b628db6fca65982400ca6f7e393f9c",
     "sha256:09a39b6f77c1f6e56effdf137c29aea153f4d1532d9d93ef60d470b6e60a1c3b"
    ]
   },
   {
    "name": "registry.redhat.io/openshift4/ose-csi-external-attacher@sha256:cdaf874ffaff5e3e4cae473c40372ef45f7d9e3bb35a93c7a715bcc30ff03a4f",
    "path": "openshift4/ose-csi-external-attacher",
    "id": "sha256:cdaf874ffaff5e3e4cae473c40372ef45f7d9e3bb35a93c7a715bcc30ff03a4f",
    "tagSymlink": "551003b7",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:5a25a26071fa9bc47fc225a7094c5766d2b5ba5672f50fef74b6ca42386d08c9",
     "sha256:7c7cded451ce5a9af3126e7f7cd85824c3272a734214c7d14340264ba5e9b342",
     "sha256:05816da29dd5410e32fbb0f1fae27961efa2ac5f166fcf355b5f5e3beb584e54",
     "sha256:112fa4f0f8a5760f1cd8891d53621a3ea3e7074fb923916e730dbb9848e2d5bb"
    ]
   },
   {
    "name": "registry.redhat.io/rhel8/postgresql-12@sha256:be7212e938d1ef314a75aca070c28b6433cd0346704d0d3523c8ef403ff0c69e",
    "path": "rhel8/postgresql-12",
    "id": "sha256:be7212e938d1ef314a75aca070c28b6433cd0346704d0d3523c8ef403ff0c69e",
    "tagSymlink": "9262ff92",
    "type": "operatorBundle",
    "manifestDigests": [
     "sha256:f5442fb0fdc59a61ae9ae2cc80307311c75901e358203363024bfec9d7459310",
     "sha256:1532f94a16f9f49d5f5c825f0b6ebe7a8d5d76ed9d25441b43a92b8b525dde0a",
     "sha256:abba41cd0355e95f5e5e557829c2fe0f55c096c495e8a524e5c6c99670ea7812",
     "sha256:04712a39996925a168cba97cb0d85490265d6622fb321c4e2d1fb7c69c899fd9"
    ]
   },
   {
    "name": "sha256:f5442fb0fdc59a61ae9ae2cc80307311c75901e358203363024bfec9d7459310",
    "path": "rhel8/postgresql-12",
    "id": "sha256:f5442fb0fdc59a61ae9ae2cc80307311c75901e358203363024bfec9d7459310",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:3de00bb8554b2c35c89412d5336f1fa469afc7b0160045dd08758d92c8a6b064",
     "sha256:c530010fb61c513e7f06fa29484418fabf62924fc80cc8183ab671a3ce461a8e",
     "sha256:6c155a0c493b106911b1fa3b975be2fc7e07ef3e8619b7d5b0d169488fce15d3",
     "sha256:4ab553311773e89b1b5ec08c47733cc2b3d17e8d79413bfae843e1f77a9105f8",
     "sha256:ef02a146c1d4df822ad227a672adb4af9d4f7dd92a475437b510d01915952efc"
    ]
   },
   {
    "name": "sha256:1532f94a16f9f49d5f5c825f0b6ebe7a8d5d76ed9d25441b43a92b8b525dde0a",
    "path": "rhel8/postgresql-12",
    "id": "sha256:1532f94a16f9f49d5f5c825f0b6ebe7a8d5d76ed9d25441b43a92b8b525dde0a",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:fea832e2f3124138814b2fa9f97e4c93af9846cd754bc170735a04fcc2b3efa0",
     "sha256:24639a74db0ea60a6d9ce7dde38c65c804be51901b34b3dcb4801ff37d88c968",
     "sha256:cc9caec422c32b87d970d6145020cefeb6ba204d046c1eace4316557caf0218c",
     "sha256:82f77fb505ad1592e5885bfcfc80c4349e23a1c48089882971df39c65f2c56bc",
     "sha256:cc8617b2d0d27a78bfa3577cd45d6c843113a17fd4e8e9a3e7ce9b77a0cfce41"
    ]
   },
   {
    "name": "sha256:abba41cd0355e95f5e5e557829c2fe0f55c096c495e8a524e5c6c99670ea7812",
    "path": "rhel8/postgresql-12",
    "id": "sha256:abba41cd0355e95f5e5e557829c2fe0f55c096c495e8a524e5c6c99670ea7812",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:2cbc2866f0e2741aa3c72c6a699db0f8b25a5a5fea7d49ee2aa4f9a97ec6ee4c",
     "sha256:17e3a5f768e10e019b5bf765f63f8f9243bdfc7856b6c5b92b2b93430a7a91e7",
     "sha256:94d83113c109588bc1fa214757a0039e7f30de42ed7198534778862ea0808ec6",
     "sha256:cd3ead44e62789c554435efdcdf55757466101c8e174bef39c22f9978436640f",
     "sha256:044f3969c464b956776b04d63f85202b55ff500f66e516feca784a23293ba348"
    ]
   },
   {
    "name": "sha256:04712a39996925a168cba97cb0d85490265d6622fb321c4e2d1fb7c69c899fd9",
    "path": "rhel8/postgresql-12",
    "id": "sha256:04712a39996925a168cba97cb0d85490265d6622fb321c4e2d1fb7c69c899fd9",
    "tagSymlink": "",
    "type": "operatorBundle",
    "layerDigests": [
     "sha256:bdee7855ef43f1c1d40221634c315c1998e5ee6f976d77dec4834f669bee371d",
     "sha256:df8985aa78d66ad0ca1e65cdf78c0a770212de626074c34770d25b8dcfc5e4bf",
     "sha256:113d1f68e376ad7a3bf129e8f089da75d1fd7a2938edec3d1dc6811a5e00aa10",
     "sha256:acdf31f9936817dab4392a0f639cd3c0287345eb1ce89310f1008184955820a2",
     "sha256:6124c9bd7f4747247b8366b1b0a34cd1759d7755a59a1916e517a1ed1192ae3d"
    ]
   }
  ]
 },
 "pastAssociations": [
  {
   "name": "registry.redhat.io/rhel8/postgresql-12@sha256:44215c5b244b190c82d9d371a8ffd39b0c83576bd85c980cc72782a5cf9e6e1b",
   "path": "rhel8/postgresql-12",
   "id": "sha256:44215c5b244b190c82d9d371a8ffd39b0c83576bd85c980cc72782a5cf9e6e1b",
   "tagSymlink": "9309afa4",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:c769fd2780a6c502139ded77166644e73222b2ba00c3d0525aacb5f3d99bf1b4",
    "sha256:33d614388eace46a65a92f238dc0231ecb204873774fa93dc1c09e7022bace97",
    "sha256:2483c23ce5a3a0837576fc1500122b59ad53a593fc04eb677cd332205d855ed8",
    "sha256:c774f718d17ef31509cda6427b44243c21aa129d122531b69a92d11ad35c2fed"
   ]
  },
  {
   "name": "sha256:c769fd2780a6c502139ded77166644e73222b2ba00c3d0525aacb5f3d99bf1b4",
   "path": "rhel8/postgresql-12",
   "id": "sha256:c769fd2780a6c502139ded77166644e73222b2ba00c3d0525aacb5f3d99bf1b4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:399eb2b7226e96b12325f0470a572b98e868286c4e7568f7623d863ae36fbe02",
    "sha256:995c1a5d6ce458ce2654ca25a9a8454a70588bca8db7b41e06e931c00333fbda",
    "sha256:8c73fd021b2dc389e7bd1472d98b55a3cfab18687c2ec5583824899091c23db7"
   ]
  },
  {
   "name": "sha256:33d614388eace46a65a92f238dc0231ecb204873774fa93dc1c09e7022bace97",
   "path": "rhel8/postgresql-12",
   "id": "sha256:33d614388eace46a65a92f238dc0231ecb204873774fa93dc1c09e7022bace97",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0f6e46285dbeaad8b2b8f01b5fe21771fc2b522ceafaf88d8f51ff88b51d87a9",
    "sha256:b88304ccd20b48c3e167431fdaa53db68d449caf91511ca66a32b356f947b6ea",
    "sha256:c069673f6051eb73897763672a108329d74c778a64d0566b23cd04751ced5411",
    "sha256:a9c6da39523e0c6ffdc9b9e36ea2c5a4ba5c380d95bd0151f8d6c1bfaa7dd5b6",
    "sha256:6f7a6591d5f2ce5a6637ab27827603868f151d28ef1a1f8caee5555b914ef509"
   ]
  },
  {
   "name": "sha256:2483c23ce5a3a0837576fc1500122b59ad53a593fc04eb677cd332205d855ed8",
   "path": "rhel8/postgresql-12",
   "id": "sha256:2483c23ce5a3a0837576fc1500122b59ad53a593fc04eb677cd332205d855ed8",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:af5458290b9eb5772f0935e6dca7d35a4b75ec3a8117aa664029b0c4cce4f51e",
    "sha256:3c524d6519aa36ee81b7f55a59fc33ecc867ed4f2bc65d992ba64c716f5501fb",
    "sha256:7d106e8ce6698e752a6e44172a72e9a66c85a36c19f541494646eb6a9bc6819e"
   ]
  },
  {
   "name": "sha256:c774f718d17ef31509cda6427b44243c21aa129d122531b69a92d11ad35c2fed",
   "path": "rhel8/postgresql-12",
   "id": "sha256:c774f718d17ef31509cda6427b44243c21aa129d122531b69a92d11ad35c2fed",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:633d8934e21d60dccb5c55df7a62f24f6ee0518f233c4b1948757a264269fb8a",
    "sha256:c94fcc6084503e3aba46fa487d92db02aa1a95337759430ebc9f8861ba3a3994",
    "sha256:f64d8e6c93dd4b01aee2fc70983785c9ee8d587baef2726d39c514b1d3b3c546"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:338f2ded01b446ca9e6e1d83d904e7e78ba2a15694cb8216433dca1bc16c977d",
   "path": "odf4/mcg-operator-bundle",
   "id": "sha256:338f2ded01b446ca9e6e1d83d904e7e78ba2a15694cb8216433dca1bc16c977d",
   "tagSymlink": "3b619111",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:fbeb28fb40e1647ea45018399f0ab43155436d935bee4f74a034dff0de1e4f33",
    "sha256:4888597f6b43b1d90a004b2a1966b7a73dbdf77e5e4cef3ee30161f08b166b34"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:1ef46ddbbee55cc94fb69e55517483d9191c6ddd64f3161cccfa0727f0a50d1d",
   "path": "odf4/mcg-operator-bundle",
   "id": "sha256:1ef46ddbbee55cc94fb69e55517483d9191c6ddd64f3161cccfa0727f0a50d1d",
   "tagSymlink": "5d261315",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:85826689e91e75e0266665635d8da280b9d2f4792bd22bae810dd2e1ba78a2c6",
    "sha256:29d694f526478a7c760b9832fb9cbb70e56ed602d0041598aa527cea2cba5932"
   ]
  },
  {
   "name": "sha256:4759fc57394a11c41dded658a7f2f25e94bdd94bd90ba8982a6686f3655127c5",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:4759fc57394a11c41dded658a7f2f25e94bdd94bd90ba8982a6686f3655127c5",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:1b890c73c3cf60b04334fded9e3edc647d64dd39ffd078317e2bd69552a2fd1d",
    "sha256:de63ba066b7c0c23e2434efebcda7800d50d60f33803af9c500f75a69fb76ffa",
    "sha256:02de04c0febbf7309be67ca2d44f57a2294768575ddfe1e48577205d845dc54f",
    "sha256:0b8d99d840c36a7c52baabad5efcd4986288428791f9f9241b773ee20e9f5ec7"
   ]
  },
  {
   "name": "sha256:50e637f68e41af76209c4a5064dc6da951138d3024a25b0c8f3a709447399eaa",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:50e637f68e41af76209c4a5064dc6da951138d3024a25b0c8f3a709447399eaa",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:9f78280d50082c329e73123d73b3debc7f5eec007d8a0c7b1d388ff69b9652fc",
    "sha256:a1a64b9c0d1a2a468c65bf81fb26d51416a3e19d95d08df39e5d7d012a25b685",
    "sha256:183f42867768c71e75d3d5fc950dccb97c96c135cde9ce2c4f2719a52ff7312c",
    "sha256:7d0bd64603531dc2d88fa6ec17fc1d05e81764f1db6c7e908dfa4dd3d8c97c7a"
   ]
  },
  {
   "name": "sha256:1f6a4f64c65084bb8257428d6ab58d0f04aae9362dc3f3c84e4988d89a237678",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:1f6a4f64c65084bb8257428d6ab58d0f04aae9362dc3f3c84e4988d89a237678",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4f639942cb5a04cfde9e90ad4590927d87ec970f46186ebe46182c2f0657584d",
    "sha256:261c17695cc21090e4719a05e282f024f0ab9a36997b3e3550ee7a97dee98668",
    "sha256:09f2ff47c9a30c87d03a4223fddf2796e0fd9764dfe0e5d8465d4676a7912064",
    "sha256:f652f0de9fead918f5702efeb672d6e44e774afd85436258f2d68569f6c6a50e"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:e2e9a3697dd3cf8ae1030eadf840a7e946131f11605e4d3fc46be27e0d1bf417",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:e2e9a3697dd3cf8ae1030eadf840a7e946131f11605e4d3fc46be27e0d1bf417",
   "tagSymlink": "748701b1",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:4759fc57394a11c41dded658a7f2f25e94bdd94bd90ba8982a6686f3655127c5",
    "sha256:50e637f68e41af76209c4a5064dc6da951138d3024a25b0c8f3a709447399eaa",
    "sha256:1f6a4f64c65084bb8257428d6ab58d0f04aae9362dc3f3c84e4988d89a237678"
   ]
  },
  {
   "name": "sha256:bee4933e98f4a94bb79c6693c95fa9f48f5f092c3b4616007a8bcc4aaa5711df",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:bee4933e98f4a94bb79c6693c95fa9f48f5f092c3b4616007a8bcc4aaa5711df",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
    "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
    "sha256:d5065fb26ae88a8a2c6a8a01f6848880a3cddb599d44a8fa2b53a65b074fa465",
    "sha256:c6c0671b9c97bfe47a2d1582ad6723b04f68a5883a12d2e5d8004ff81aa90643"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:7473ccb3651cda84119af3f73bc05d9634f7999461d7fca1ded03f067a942238",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:7473ccb3651cda84119af3f73bc05d9634f7999461d7fca1ded03f067a942238",
   "tagSymlink": "31b83f0c",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:0c2c37394fc7ffabe3a3b7d5af2d53145e1d448d3d457008122ae8e783b3b2fa",
    "sha256:020b1e080bd3bc9131570105f07e129e0929b5e2ddb489d6b0ce83a032c8b0e2",
    "sha256:bee4933e98f4a94bb79c6693c95fa9f48f5f092c3b4616007a8bcc4aaa5711df"
   ]
  },
  {
   "name": "sha256:0c2c37394fc7ffabe3a3b7d5af2d53145e1d448d3d457008122ae8e783b3b2fa",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:0c2c37394fc7ffabe3a3b7d5af2d53145e1d448d3d457008122ae8e783b3b2fa",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
    "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
    "sha256:2c5e66a566111754d906ba465fe869d3e5d5800599456ef336e4c6aee8545c97",
    "sha256:fe2e0ea53d979b83d1d5c7a492cb024aa9621f27d8904ed87bd34e0216dcb562"
   ]
  },
  {
   "name": "sha256:020b1e080bd3bc9131570105f07e129e0929b5e2ddb489d6b0ce83a032c8b0e2",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:020b1e080bd3bc9131570105f07e129e0929b5e2ddb489d6b0ce83a032c8b0e2",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
    "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
    "sha256:2fd81bf5bf180645859eef00c7f641e4b53839a037532c0efc8fc562ccbdb963",
    "sha256:5964a0ec9b903ff9a61a2fc9a845b8d4389d78d6bddef7d3936b671fce82f821"
   ]
  },
  {
   "name": "sha256:70c99ac6ee5b4787ca471929b17a57a6d2842b3b52b9bbba13996330060c1fa5",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:70c99ac6ee5b4787ca471929b17a57a6d2842b3b52b9bbba13996330060c1fa5",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
    "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
    "sha256:8aa7fec08d608847a3bedb5fb4e4bb13d5392d9f2c078632434d2df69d2c8c59",
    "sha256:6dd68e5624ddbbd0f967cdd223a6e621966e43ce5517ff668e4beaf3f77bd1e2"
   ]
  },
  {
   "name": "sha256:c89dd3e4633489c40647a3bad96a5bae24fa56bad03aba68ce852e5fa6e1045b",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:c89dd3e4633489c40647a3bad96a5bae24fa56bad03aba68ce852e5fa6e1045b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
    "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
    "sha256:1f2ee84a39231c5d8af5b3d3a99f4123b912989f5b606aeae307a7520b2d0b95",
    "sha256:292256665bf3b044fb89662960147e0dcc90b349e592d175c3cccbd43a064eb1"
   ]
  },
  {
   "name": "sha256:a1796587fcdbb680fbc3045a9934712695b46d3af782f04f2138e946266d1823",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:a1796587fcdbb680fbc3045a9934712695b46d3af782f04f2138e946266d1823",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
    "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
    "sha256:f12529c54255192499d807bf357eb5ab596c33f8b9317dab5e81830579cd8511",
    "sha256:9fb19fbab26328209060199fb81de66792436c30dd347b14cca064e255fe677f"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-node-driver-registrar@sha256:3308ef98afab494b80aa1a702924407cf114bce6e0ad92436e508d7dc951521c",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:3308ef98afab494b80aa1a702924407cf114bce6e0ad92436e508d7dc951521c",
   "tagSymlink": "e30e1b37",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:f2f0465327384d567f80dda5123d6d95d0e44659cdc5cbc37d58c56cac863e82",
    "sha256:70c99ac6ee5b4787ca471929b17a57a6d2842b3b52b9bbba13996330060c1fa5",
    "sha256:c89dd3e4633489c40647a3bad96a5bae24fa56bad03aba68ce852e5fa6e1045b",
    "sha256:a1796587fcdbb680fbc3045a9934712695b46d3af782f04f2138e946266d1823"
   ]
  },
  {
   "name": "sha256:f2f0465327384d567f80dda5123d6d95d0e44659cdc5cbc37d58c56cac863e82",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:f2f0465327384d567f80dda5123d6d95d0e44659cdc5cbc37d58c56cac863e82",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
    "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
    "sha256:6ea7421ed0d52818cda9c866ec3e6b0fc07f83328f01b5e762e07ef3740177a5",
    "sha256:033beb41d6369d0584920966345fb79c6b59a9b20b68a323ab6844f26ec7fbe7"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-provisioner@sha256:42563eb25efb2b6f277944b627bea420fa58fe950b46a1bd1487122b8a387e75",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:42563eb25efb2b6f277944b627bea420fa58fe950b46a1bd1487122b8a387e75",
   "tagSymlink": "495ed5c4",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:ca4f156e26c892fd998bda5145aab16cdccc31d64e6d30fb983425562d344fb6",
    "sha256:e540dd147f8ed981e8b2ebb3142e0004f5fcb0b9ed57408d600835e96ff7b459",
    "sha256:d879c3de3949af528c56d3af7d2747b5195d1660d4877ea8eeac1c04afe7e99f",
    "sha256:b0e47366feb0add960cf6891f762bc5019853107321ba6132afd86a63a85adc9"
   ]
  },
  {
   "name": "sha256:ca4f156e26c892fd998bda5145aab16cdccc31d64e6d30fb983425562d344fb6",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:ca4f156e26c892fd998bda5145aab16cdccc31d64e6d30fb983425562d344fb6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
    "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
    "sha256:f3c0967afe0ac69e5b13dadafceaef548f3ac0f782c378e996554301f2f5f7b5",
    "sha256:f4f57fec63a30587f779277f6887bf096dac5ba07da123d2b1d781e78f853353"
   ]
  },
  {
   "name": "sha256:e540dd147f8ed981e8b2ebb3142e0004f5fcb0b9ed57408d600835e96ff7b459",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:e540dd147f8ed981e8b2ebb3142e0004f5fcb0b9ed57408d600835e96ff7b459",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
    "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
    "sha256:2b29a07b4ba818835b1d318faa9cbd05e8e8202ae1aea563cd37f2a2be2dc981",
    "sha256:8e23c4c458df809b75c2a5b1bc2c38668e094a191297392f6b6f73dbc032b634"
   ]
  },
  {
   "name": "sha256:d879c3de3949af528c56d3af7d2747b5195d1660d4877ea8eeac1c04afe7e99f",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:d879c3de3949af528c56d3af7d2747b5195d1660d4877ea8eeac1c04afe7e99f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
    "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
    "sha256:ebfe24ce1315918690dcaa33d9547db2388f03b2de2b09172f9442b97f1e1adf",
    "sha256:bcf47465daf8023bbac6b9960a950b0026c3653fd223f78b484b5077d1402145"
   ]
  },
  {
   "name": "sha256:b0e47366feb0add960cf6891f762bc5019853107321ba6132afd86a63a85adc9",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:b0e47366feb0add960cf6891f762bc5019853107321ba6132afd86a63a85adc9",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
    "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
    "sha256:bb543b09c739670ee0dfe60fdccbf849b7c2aadf58da97395d0c4ad817115356",
    "sha256:eefcae4d83fe669a491ea72134686473821119836edd2cbeccdf85a7b447f6f3"
   ]
  },
  {
   "name": "sha256:a3a54335f1b08faa686ded823a35407a9f91e4481455f189639d233709f7c4cc",
   "path": "rhel8/postgresql-12",
   "id": "sha256:a3a54335f1b08faa686ded823a35407a9f91e4481455f189639d233709f7c4cc",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3abc8c0d3d4265b5efb17447cd4a399fc70858b08d7cd5dce88dca7a09bc089",
    "sha256:ada7e11fb107d011a3b016cc659ca3f138f11725949328d92d3714ac15ef4ce2",
    "sha256:d84558a70da2c2b3d51676a2caeeee48c18fd37f2ba3e39fa42baf8ddfcb4742",
    "sha256:e71bb50d04ca57e182930e803147105abf2708a2ddd3d8fbadb009a3d7aa88d3",
    "sha256:73bcb9672d417c9a6b4e7b42f1511a85637a1f3fa4061740bc577db25355f74d"
   ]
  },
  {
   "name": "sha256:dbd441c0b1ea839c2c485616336e79ce711f7214a2eccff43ad356758f875fec",
   "path": "rhel8/postgresql-12",
   "id": "sha256:dbd441c0b1ea839c2c485616336e79ce711f7214a2eccff43ad356758f875fec",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92559d5f5a908101d2776f8e756d73806b2bd3354be51e12d3111c90a4f09b07",
    "sha256:083e3eac55c875258c6477c979a400f62751e489a5aa9ffbbf0bf0bfdf773bcf",
    "sha256:71cf785318807dbca4c866feb2e756e67c6898947ac3ff0410374dac21595113",
    "sha256:389b8b9434e21f1bac99c79edbc1dce059a4c8f81b3df8c7bd6441ef39e87cec",
    "sha256:54e3a591fd221b0798085f078145e03c9c9b1a51154e827ceb71e05c8866ebd8"
   ]
  },
  {
   "name": "registry.redhat.io/rhel8/postgresql-12@sha256:96d2472910fd59acd4fc4371de03dd44071cab7d4f095f4e3bf30e646c9b0a82",
   "path": "rhel8/postgresql-12",
   "id": "sha256:96d2472910fd59acd4fc4371de03dd44071cab7d4f095f4e3bf30e646c9b0a82",
   "tagSymlink": "b3f074fc",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:e3537a12097946baba447c1e0e00306cca045cfe9e9ff4149334fde4e54d6985",
    "sha256:cf14141ebf2937ae498b153a74122daa48be124dcaffa01c5ec68517c0931ba3",
    "sha256:a3a54335f1b08faa686ded823a35407a9f91e4481455f189639d233709f7c4cc",
    "sha256:dbd441c0b1ea839c2c485616336e79ce711f7214a2eccff43ad356758f875fec"
   ]
  },
  {
   "name": "sha256:e3537a12097946baba447c1e0e00306cca045cfe9e9ff4149334fde4e54d6985",
   "path": "rhel8/postgresql-12",
   "id": "sha256:e3537a12097946baba447c1e0e00306cca045cfe9e9ff4149334fde4e54d6985",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0a21bb5475ea5fbcfdeab2bbe08a1cf4ef0b55382d553d2c213620763078223c",
    "sha256:38dd71adcfc1f964c6f3ba6ae3b6daa95f612681cfb05298b225bb6347942f56",
    "sha256:408d72b5afe1db674fd2e4bd38c8ca7138ac3c5d1b523be9fe48fcc674660890",
    "sha256:f1500b692b89fb4c7b0ddc19991c1481547a6ab33969699a21c8dbf89431e0cd",
    "sha256:f1e76aa9f05861ad72f19d81acff1eb47950ade41f96c9e19d15d8235023268d"
   ]
  },
  {
   "name": "sha256:cf14141ebf2937ae498b153a74122daa48be124dcaffa01c5ec68517c0931ba3",
   "path": "rhel8/postgresql-12",
   "id": "sha256:cf14141ebf2937ae498b153a74122daa48be124dcaffa01c5ec68517c0931ba3",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b8b75f63afa4bfde71a4fa74e3a5f29334875de02294fd3d4d07c1ece7b8eb12",
    "sha256:a23a85b9dc9728803ce83b69bb1a7e3cef2a2be5bb35c0ec9fc16f72b17fb9ae",
    "sha256:c01393830c871ae35099e945c55c118f74292f9a86354d018ebe1e38cde42391",
    "sha256:e2de047de517517140e3668fa7da60caaabcb46049b4217859297e9749db2805",
    "sha256:3452245a427a21f58ae20456bee00935c5424127d1442f0815abbbd3094a63ec"
   ]
  },
  {
   "name": "sha256:b3105c212688c11c3c229a2c80404c50a08acd800ac46b59a88ae26dd5e55fdd",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:b3105c212688c11c3c229a2c80404c50a08acd800ac46b59a88ae26dd5e55fdd",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
    "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
    "sha256:b3567a89e612858a164eb24cc3795c4d1a4ea3f94764e005aabc02a26095fbcf",
    "sha256:c9ae8147d914f1616851e4eea5f7554130de6a7194be6ef96d6f8fc13398633f"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-resizer@sha256:1140505cccb1f88e2caccb4d6ae4d1b878381d531b0d9c029d1aaba3dbecd0ef",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:1140505cccb1f88e2caccb4d6ae4d1b878381d531b0d9c029d1aaba3dbecd0ef",
   "tagSymlink": "1b968cc",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:06043f3ce603c130d77bc8f2508476b204d8bc9e03e04808b00d913d2e44190c",
    "sha256:d4fe2e93e294700a4bc5097f77a87754b41d49cbb04517e978ee2fdd03b6b242",
    "sha256:b53c7e37889e9539c222e66487b73bbe0673728259e9aab69e9cda9d59929db3",
    "sha256:b3105c212688c11c3c229a2c80404c50a08acd800ac46b59a88ae26dd5e55fdd"
   ]
  },
  {
   "name": "sha256:06043f3ce603c130d77bc8f2508476b204d8bc9e03e04808b00d913d2e44190c",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:06043f3ce603c130d77bc8f2508476b204d8bc9e03e04808b00d913d2e44190c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
    "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
    "sha256:c3b42ad57cafd1f02309543c61e943efae75fde4fed6ed4ee4403d9da9e11fd8",
    "sha256:e416ad9838be4b15569c1fcef58dce51d64f2db06df6825362acf7c779322e88"
   ]
  },
  {
   "name": "sha256:d4fe2e93e294700a4bc5097f77a87754b41d49cbb04517e978ee2fdd03b6b242",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:d4fe2e93e294700a4bc5097f77a87754b41d49cbb04517e978ee2fdd03b6b242",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
    "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
    "sha256:f59ad339a71befd3e1884815a8ef7c39aed1ecb54ca8b8df08ecb858d0dd4997",
    "sha256:2c713cb1823844f2efc4cf3b6b224e99f46123724d2d5b5b9d8bf2269303b4f6"
   ]
  },
  {
   "name": "sha256:b53c7e37889e9539c222e66487b73bbe0673728259e9aab69e9cda9d59929db3",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:b53c7e37889e9539c222e66487b73bbe0673728259e9aab69e9cda9d59929db3",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
    "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
    "sha256:760ca557679402ff919a59d7e5063049dbb10f6f0ce682e944bcebdc1dfdf42f",
    "sha256:9a74754947ac2f24a520246cb13af4a396168f6671e5fc73b8f570cb54a6396e"
   ]
  },
  {
   "name": "registry.redhat.io/rhel8/postgresql-12@sha256:66fa333966bf08f3ac0d5e270b6ffb03717b5b6a3df30663f88acfd3f8566d13",
   "path": "rhel8/postgresql-12",
   "id": "sha256:66fa333966bf08f3ac0d5e270b6ffb03717b5b6a3df30663f88acfd3f8566d13",
   "tagSymlink": "739f35b0",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:ea23690e3517b7e6212482b880bea41daa66ac9713253a11e345bfaab3ad8e1d",
    "sha256:c8fd6d640b44589c27c4431b5ac6b5a49dbdcc6b2cbca3286845dbe26a9efa92",
    "sha256:97756bcc5cae0b043353b693cb11f5462a48af525d0c7ff79ffff015cf986939",
    "sha256:1833a9a1d5dcae60248c961e6e2ce3ff334b6999b0e36b9963eb49d01678c96d"
   ]
  },
  {
   "name": "sha256:ea23690e3517b7e6212482b880bea41daa66ac9713253a11e345bfaab3ad8e1d",
   "path": "rhel8/postgresql-12",
   "id": "sha256:ea23690e3517b7e6212482b880bea41daa66ac9713253a11e345bfaab3ad8e1d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:9bd1aeb0dd8f02cb3837d0da41cb72c0eca2738d78553e7556b7a57d41012a72",
    "sha256:e0290a08d28ca7906f03c9a30fcc51aba34c55ed37079e56e88c7f2c1108020c",
    "sha256:5c18d94fb93b0299d5e960fd7ca6581bf7f9184e7c0d17f34cadae28e741a2bb"
   ]
  },
  {
   "name": "sha256:c8fd6d640b44589c27c4431b5ac6b5a49dbdcc6b2cbca3286845dbe26a9efa92",
   "path": "rhel8/postgresql-12",
   "id": "sha256:c8fd6d640b44589c27c4431b5ac6b5a49dbdcc6b2cbca3286845dbe26a9efa92",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0f6e46285dbeaad8b2b8f01b5fe21771fc2b522ceafaf88d8f51ff88b51d87a9",
    "sha256:b88304ccd20b48c3e167431fdaa53db68d449caf91511ca66a32b356f947b6ea",
    "sha256:102321c26dfd3de3fddf16d8e4d8ff9137a0fa6a4a3db0c1bdf5aa1a14f33191",
    "sha256:554ef1aa8114e3ba74d27052d50e9f7d88a0f5ab0596c7506303b5bdbcc6ad4c",
    "sha256:a2c0db9951e54c202f0fcb530622d27e2da70911133dcd3d70eeb67298d9ec68"
   ]
  },
  {
   "name": "sha256:97756bcc5cae0b043353b693cb11f5462a48af525d0c7ff79ffff015cf986939",
   "path": "rhel8/postgresql-12",
   "id": "sha256:97756bcc5cae0b043353b693cb11f5462a48af525d0c7ff79ffff015cf986939",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:cfb0baf8b0d9c657e3a5767a37e7ecbb623e41b646d02307617959669421c025",
    "sha256:35f5c865fa426f65c506fb9bf6885bf0745a114ba8bbf5f7887df7efd376cb83",
    "sha256:d1f35ac7b77818bf17e5074c81ea99c9cf75f6182fb61f2ff47b4cf9207982a0"
   ]
  },
  {
   "name": "sha256:1833a9a1d5dcae60248c961e6e2ce3ff334b6999b0e36b9963eb49d01678c96d",
   "path": "rhel8/postgresql-12",
   "id": "sha256:1833a9a1d5dcae60248c961e6e2ce3ff334b6999b0e36b9963eb49d01678c96d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:9654b36842ecd85c9c3fbb548ba6cfb9aa28694df058bcffd37e4bf0895da0f4",
    "sha256:c8838c8699c7c4b47db4aa391b8e331e3d25be9f8968992cd44909a6fe309a49",
    "sha256:b80e261c7d88d9006592d7018eb16dbfd53042b4437561e762de8633dfa834ae"
   ]
  },
  {
   "name": "sha256:285af876515891957d6afc5182fca519a2e7bd6d29488dd121be3e0ae5c52c45",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:285af876515891957d6afc5182fca519a2e7bd6d29488dd121be3e0ae5c52c45",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
    "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
    "sha256:c73620c202e30f7ae901039b5b7b72ac0e2e650e82a3924a5cad62d94f78b923",
    "sha256:dd00585cbd9cabe8c6f9609d2cd31396e256d6e7dbe48feee704102df07924cb"
   ]
  },
  {
   "name": "sha256:a639ff8d8380173956c8ec25186d2382f7d9eece795a9f913afb98d0f54ffa64",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:a639ff8d8380173956c8ec25186d2382f7d9eece795a9f913afb98d0f54ffa64",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
    "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
    "sha256:34527608ca5327151cd31ceb75f4eaa041a956060e33c6d205f7665271626fdd",
    "sha256:9d409a2324159e5a0583c015c8c134be7d0030105db42da4a125745fe7f4e0bc"
   ]
  },
  {
   "name": "sha256:68a3a70c02d20ec6d075cfc18edcb118fa6eb4b78600ca460448eeaca0ab0922",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:68a3a70c02d20ec6d075cfc18edcb118fa6eb4b78600ca460448eeaca0ab0922",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
    "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
    "sha256:3ff7234a3df85e1d7ecdda9119a66353e59ee86784006c56c3ed984758284581",
    "sha256:a75f51534fef869c5a9a174aaeab64493e0b7505166931c48fcfc8f0dad39038"
   ]
  },
  {
   "name": "sha256:995f4fad844d47dd91c3b5e8680620f9906d4e6e1ea4ec42bd5e06a7c3989a40",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:995f4fad844d47dd91c3b5e8680620f9906d4e6e1ea4ec42bd5e06a7c3989a40",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
    "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
    "sha256:1acc65a3b6c75698c3873a8f393fde62b7f8c735b973efd522ac2ffb70505974",
    "sha256:511396624419354077b77efcbdcf700dabb2ba88069e42f4937aaefb579295bd"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-resizer@sha256:e2fb943852ae1c55f88a1d1668b6f375a60cbc0f7373559aff190775ad2a7f87",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:e2fb943852ae1c55f88a1d1668b6f375a60cbc0f7373559aff190775ad2a7f87",
   "tagSymlink": "40c540f3",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:285af876515891957d6afc5182fca519a2e7bd6d29488dd121be3e0ae5c52c45",
    "sha256:a639ff8d8380173956c8ec25186d2382f7d9eece795a9f913afb98d0f54ffa64",
    "sha256:68a3a70c02d20ec6d075cfc18edcb118fa6eb4b78600ca460448eeaca0ab0922",
    "sha256:995f4fad844d47dd91c3b5e8680620f9906d4e6e1ea4ec42bd5e06a7c3989a40"
   ]
  },
  {
   "name": "sha256:4da96689013683b8c903bc95958b8f1b35de15a4ea219c6664caf63b50c50a67",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:4da96689013683b8c903bc95958b8f1b35de15a4ea219c6664caf63b50c50a67",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
    "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
    "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
    "sha256:37b8f2b7b2776e2a18cb7d15f0372610170c72671f316016287e7a4927b1468d",
    "sha256:8e014ea3f33ffe45a8b013bfb0e5a8ccc02773acc7e2b0d17773ebccfc54915e"
   ]
  },
  {
   "name": "sha256:c6446d2c3975141010cc201b339f4df06fa76706fccf0efcd55f21ce0f9c695c",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:c6446d2c3975141010cc201b339f4df06fa76706fccf0efcd55f21ce0f9c695c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
    "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
    "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
    "sha256:ec8dd2e6cc4a8e800bdc7d95375cf22e29efa3c4260045298165e586bfb640f4",
    "sha256:d1e9d9fb0b7af054b90fd6fbc1db947de03027383a3986fb8623b75bd21a66d6"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:98f3cea84e4f25fbd0e55439c31d7a7870449fea050bf41cad3867d9036cacf0",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:98f3cea84e4f25fbd0e55439c31d7a7870449fea050bf41cad3867d9036cacf0",
   "tagSymlink": "97047474",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:36888d4ae8c40f58a031dbfaeed49dd13b0ff6b43403e41401fb7e3bfdee4032",
    "sha256:4da96689013683b8c903bc95958b8f1b35de15a4ea219c6664caf63b50c50a67",
    "sha256:c6446d2c3975141010cc201b339f4df06fa76706fccf0efcd55f21ce0f9c695c"
   ]
  },
  {
   "name": "sha256:36888d4ae8c40f58a031dbfaeed49dd13b0ff6b43403e41401fb7e3bfdee4032",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:36888d4ae8c40f58a031dbfaeed49dd13b0ff6b43403e41401fb7e3bfdee4032",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
    "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
    "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
    "sha256:11ec953f29b40850309441ef947410538317902cd1d9741476cc4d2d3c93b793",
    "sha256:2f84a6258fa7c83c9b09ba81a11dbe1cf3725260525609599c01d1668c97eee7"
   ]
  },
  {
   "name": "sha256:0953fadd1a08e8d6327423d9d738aa4a27045e22d35c12f8fed54f5094081e74",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:0953fadd1a08e8d6327423d9d738aa4a27045e22d35c12f8fed54f5094081e74",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8ae94d44715e38323c503f34985d4dae431ad8c200aaffd1806ec5c6b2f9c2f",
    "sha256:d2476c1919664b73a98495ff6e8d395a5c7cd0a461f1c80d6eb985d1c001303e",
    "sha256:a653e1147119d3d27931a8f85a214df5b973e3250b3cca0e60bfd249754108f8",
    "sha256:abdde89a6f15981d3529adc4e5abe53957de22ae583f144375c9cf3bb3ecad40"
   ]
  },
  {
   "name": "sha256:92f9b80b3d41eb475657f39f62ffb70508f667a60b8e77affbeaca349084d1b3",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:92f9b80b3d41eb475657f39f62ffb70508f667a60b8e77affbeaca349084d1b3",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e9459e3a98cc790007c3680dd8b292ea532d820ea8cbdf02344fe6c370d82a95",
    "sha256:f3992bbd282187c79c59ab9612f11590577b44953233c624e1700082117db955",
    "sha256:b659dc1ba9af4250c2308cd059a647820d954ae6e067186a6acd8f58d216522d",
    "sha256:9e91e8dabaafacfb11aac9efa05cdc246206938be2e59e6800ccae488bdc202c"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:cdd4838430fde2c9fcec7cd37429c2cc99c8f4bbdc27e4069f8abe4bff88498f",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:cdd4838430fde2c9fcec7cd37429c2cc99c8f4bbdc27e4069f8abe4bff88498f",
   "tagSymlink": "f845856f",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:219d6d492380d0a28b5bfaf7b38d91e72cbca61e870106e2cc4010565afadd4f",
    "sha256:0953fadd1a08e8d6327423d9d738aa4a27045e22d35c12f8fed54f5094081e74",
    "sha256:92f9b80b3d41eb475657f39f62ffb70508f667a60b8e77affbeaca349084d1b3"
   ]
  },
  {
   "name": "sha256:219d6d492380d0a28b5bfaf7b38d91e72cbca61e870106e2cc4010565afadd4f",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:219d6d492380d0a28b5bfaf7b38d91e72cbca61e870106e2cc4010565afadd4f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:1e09a5ee0038fbe06a18e7f355188bbabc387467144abcd435f7544fef395aa1",
    "sha256:0d725b91398ed3db11249808d89e688e62e511bbd4a2e875ed8493ce1febdb2c",
    "sha256:4c41313c0b05a90f14def717149dc166937b92ec9e10c7995782af529d7850cc",
    "sha256:4a583e33f1036f0cfb0254cc6786e7b1241c3c559908c4b8964a7648a5b1ac3d"
   ]
  },
  {
   "name": "sha256:8afbd420cf7d7662f61adee70305e8dc4f13db6a45a15a896a3ef889dfd54957",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:8afbd420cf7d7662f61adee70305e8dc4f13db6a45a15a896a3ef889dfd54957",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
    "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
    "sha256:5944fe0396dfe30076bf4dabe0d03e5860bfa1aad765410684ea2de66683c59b",
    "sha256:a381e681640566d2d3d0cf0f2ebc5bf46195ca2ad340c06cf1ff4e1304a68d39"
   ]
  },
  {
   "name": "sha256:654621110229e306eb113bf1fe84d0cc486567fd609f5302a0be9a0498b2800f",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:654621110229e306eb113bf1fe84d0cc486567fd609f5302a0be9a0498b2800f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
    "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
    "sha256:5cc9efb5115bff872c1403eade99bc17cf2a42bd46db6885378e3c2463038506",
    "sha256:2590653bbf92a4215733c1c74b296c787758646c3a0b07de42a00233b2e2eea1"
   ]
  },
  {
   "name": "sha256:4072ec25e2a30d8e065467cddefea624a674d18cba76d44869459352d6cd5963",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:4072ec25e2a30d8e065467cddefea624a674d18cba76d44869459352d6cd5963",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
    "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
    "sha256:1b8df5295ddcc472fd632293bb6f47857c6797bcfff9747411f8965290e8e89d",
    "sha256:eb09e326a0e07484015fff3742e4f135930712b68a5e82b2df4b3073dc255290"
   ]
  },
  {
   "name": "sha256:debce175867e502bc7c60b16ed5b8dcae89df8867c43786796764a2895ba0ed7",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:debce175867e502bc7c60b16ed5b8dcae89df8867c43786796764a2895ba0ed7",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
    "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
    "sha256:076d705c5799a9c5fe30eabcba203ca0c57e05d3685d80d9870fff514dae2c06",
    "sha256:2dc2e749421708d0739bde49c23866fd4dd690b846c0a64025dd4ea6432afe64"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-provisioner@sha256:106141d7e11e5495f75f497d0eeab106080224a504d3792501bd61722902bbfe",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:106141d7e11e5495f75f497d0eeab106080224a504d3792501bd61722902bbfe",
   "tagSymlink": "d104921b",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:8afbd420cf7d7662f61adee70305e8dc4f13db6a45a15a896a3ef889dfd54957",
    "sha256:654621110229e306eb113bf1fe84d0cc486567fd609f5302a0be9a0498b2800f",
    "sha256:4072ec25e2a30d8e065467cddefea624a674d18cba76d44869459352d6cd5963",
    "sha256:debce175867e502bc7c60b16ed5b8dcae89df8867c43786796764a2895ba0ed7"
   ]
  },
  {
   "name": "sha256:50713e630f6e9d1e87dc7798c8360d1755c8160355ec2e17f362c45f13ef7648",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:50713e630f6e9d1e87dc7798c8360d1755c8160355ec2e17f362c45f13ef7648",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:3d4679d6550ed04bed8f137eccb2f5198efb4491950ec50f15831eda1b6ad963",
    "sha256:a350b5699f9560463e065968d8c944145b6167eea7ab28e93085ae5dc891f4a4",
    "sha256:a788fdb7cd06df714c8379eb38da19ec7e829d51a2741d12cacfe83c56a12c9c"
   ]
  },
  {
   "name": "sha256:131b0e221d9f0ed99223a534333cc38fba234faeccff9c5d318623229b7b1ec6",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:131b0e221d9f0ed99223a534333cc38fba234faeccff9c5d318623229b7b1ec6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:abad6baafc4cb0a77e481dea4a8bc47a7ed5b5c944d494c18bfbec3aeba4e8cc",
    "sha256:e2487a2cb0100b0dd94bed09cab38bce7d663246ad31d602fe94948e4c5d659c",
    "sha256:76d0a4044d9697005358212c147d65346677c3010e917feb2c7ddd6d40d8c282"
   ]
  },
  {
   "name": "sha256:682c8f8bb195c81a2022892b78ab6ce2619c69710638b74afe3f26c2dad28e64",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:682c8f8bb195c81a2022892b78ab6ce2619c69710638b74afe3f26c2dad28e64",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:ac3143d6092da265fe38fcde94e5aa790146bc14fc0580c8093e76bac041cda5",
    "sha256:ac66c0686cba60038ea36fc327219b74aa6990595d9fedbab70db5fd7ed202af",
    "sha256:328185e31f69efd5f81f03a7277d2ebcf4ccbef46d3945bf2b70c96bcb88a822"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:79c96fb77a37f46706dd156090ab39489975506bce3d01aa3852c5d90b4d4aec",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:79c96fb77a37f46706dd156090ab39489975506bce3d01aa3852c5d90b4d4aec",
   "tagSymlink": "bf20037c",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:50713e630f6e9d1e87dc7798c8360d1755c8160355ec2e17f362c45f13ef7648",
    "sha256:131b0e221d9f0ed99223a534333cc38fba234faeccff9c5d318623229b7b1ec6",
    "sha256:682c8f8bb195c81a2022892b78ab6ce2619c69710638b74afe3f26c2dad28e64"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:d9f60aed2f3fc928f5814c864f2cdb59f77bc0fa0a81c48f89c66870faccd570",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:d9f60aed2f3fc928f5814c864f2cdb59f77bc0fa0a81c48f89c66870faccd570",
   "tagSymlink": "31c39cf0",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:7b58cd5003664544ee17bd05aca2bbe4cceb3c4bdcb622f384167ff7ede26034",
    "sha256:d3db626c2cded2606c4db817b761de6fc4406f53a85404c3f3257e775ecadadf",
    "sha256:596ec92d121ba820535052c65e26f4460a1f806cc9c161eae3502478839d8f96"
   ]
  },
  {
   "name": "sha256:7b58cd5003664544ee17bd05aca2bbe4cceb3c4bdcb622f384167ff7ede26034",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:7b58cd5003664544ee17bd05aca2bbe4cceb3c4bdcb622f384167ff7ede26034",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
    "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
    "sha256:0ca9810b9c1cb0e88ab35a882ae6db8efc00817399ac7ecd1ead19fd225bef94",
    "sha256:3632ed13e0c45964b9d20b94bd83a0e4d5d107b06671e4965b0329b741eee40f"
   ]
  },
  {
   "name": "sha256:d3db626c2cded2606c4db817b761de6fc4406f53a85404c3f3257e775ecadadf",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:d3db626c2cded2606c4db817b761de6fc4406f53a85404c3f3257e775ecadadf",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
    "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
    "sha256:5f13befa133daa413cd77e54f4bc4038d724e6f51221d27f024c95c39f2e6c8d",
    "sha256:b8ff07e9a2bacde97465bef9ede6b86f0994100a309d7eaf63e21a15d90c423e"
   ]
  },
  {
   "name": "sha256:596ec92d121ba820535052c65e26f4460a1f806cc9c161eae3502478839d8f96",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:596ec92d121ba820535052c65e26f4460a1f806cc9c161eae3502478839d8f96",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
    "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
    "sha256:c34d4b530fcb330bf9fc65eca112f33fcfad1e34ac2a7fad605c5c3eca7f6f75",
    "sha256:cacfd134e9509f6e3cc050b6cd389552094334dd5025be7db91a1d7a9a7a4df4"
   ]
  },
  {
   "name": "sha256:320f0b0cabb980087c9946ce8c95a49e5966019f723a5f1831f3b65248635243",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:320f0b0cabb980087c9946ce8c95a49e5966019f723a5f1831f3b65248635243",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:02863a09124c1837ee0672a011fb7e2d5c95ae16af6b569f65d2e0f763127ddc",
    "sha256:97aead8e17dadf7e07e5153ee6d5a68d28e46847e01db6d9325742076043fd20",
    "sha256:f49354925a1061f031d15638d46b605b3905052809368b582847a68ed5e38ac2",
    "sha256:6d4fb2b180a5293b3bd4740b4d9a52d2f33af400bf694ddc09f98ce8238afd92"
   ]
  },
  {
   "name": "sha256:463ffc78557e0076dd37cc20ccad7948e76170b5632b8119c0a0b213285f36b0",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:463ffc78557e0076dd37cc20ccad7948e76170b5632b8119c0a0b213285f36b0",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:220d447748c8866cbfeac8fb3534dd8d49cc8b99cc625041414c17d0f80e02ca",
    "sha256:8909629d32e7d0fef085a5fcee0e0f318367006d81be0d5da8e0a209ee230793",
    "sha256:eee40947b182151b0af58856842ae7482231cf6f68a4dae90fc93e74d6276f63",
    "sha256:63190a8992c6286f99eef36b74cc1b6310002166e23b460fc7d18a251380b70f"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:d15076109b87ebfbca4dad174d5cdc46d6f1c911cfc8fea3fe6d743bc1891847",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:d15076109b87ebfbca4dad174d5cdc46d6f1c911cfc8fea3fe6d743bc1891847",
   "tagSymlink": "70d22a83",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:f9b48b50629360b06cc8f88df99ae61e0f02fe7ba69f66ee03d2a66be670abc4",
    "sha256:320f0b0cabb980087c9946ce8c95a49e5966019f723a5f1831f3b65248635243",
    "sha256:463ffc78557e0076dd37cc20ccad7948e76170b5632b8119c0a0b213285f36b0"
   ]
  },
  {
   "name": "sha256:f9b48b50629360b06cc8f88df99ae61e0f02fe7ba69f66ee03d2a66be670abc4",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:f9b48b50629360b06cc8f88df99ae61e0f02fe7ba69f66ee03d2a66be670abc4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d3b9a4a690bf1791b874c3495c6a8e2c039150b5882374cd9c42dd4bba68ba31",
    "sha256:a049ed70eeb87542c711449e14b6a7ccdde9ca2219d749fa0872aa755f2a89cb",
    "sha256:c0ee94b4891b36be832181adf5d8936a872f4dc74bf72fac37d5e114d8ac485e",
    "sha256:8c69d5f8e0bbf1d8b190068264e4a9ba1ad83c991b5965eb864a5a0283cf3064"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:ef2c06eaaf145efaabc638045f92bec3a4e50c892b261eb35a706446a0ffe7f5",
   "path": "odf4/ocs-operator-bundle",
   "id": "sha256:ef2c06eaaf145efaabc638045f92bec3a4e50c892b261eb35a706446a0ffe7f5",
   "tagSymlink": "a5de349",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57eae29299a1b1cf951e49b46fca184d8366acbd283cf88f321c59f0c2017472",
    "sha256:7c0424048fe9b970fc99e4f96e92f6c80160dab11f0992bd8456400f9a4b2393"
   ]
  },
  {
   "name": "sha256:cc200547f588bba56d2a0c54f62dcb95ce08db1be4289f43bc66d56cbb8aa9c4",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:cc200547f588bba56d2a0c54f62dcb95ce08db1be4289f43bc66d56cbb8aa9c4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
    "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
    "sha256:8083d37c1cce754dd0a1edb6ba50b3cdbd217f057ed8cb817727c94828e6452d",
    "sha256:29d06dcbe45dfb19043b6eff67f1f1eea916401ef6d3b80187a9f68a354c7e42"
   ]
  },
  {
   "name": "sha256:56a7857ecba3bfc6170950f06d156b79feee36f961670d81457339d1cbe9fbaa",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:56a7857ecba3bfc6170950f06d156b79feee36f961670d81457339d1cbe9fbaa",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
    "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
    "sha256:992fb547dce19426af3f6453eb1a00a308de234b6121765e5fb371e63f01e541",
    "sha256:eb879e8fc7c45332f2d4e95171bc35e27845a7a49b3a9c76613942bd7e88ab7f"
   ]
  },
  {
   "name": "sha256:d6959fc60179ff800de7a4380f4f759237774636571c299169ecf5b42bd3f3f1",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:d6959fc60179ff800de7a4380f4f759237774636571c299169ecf5b42bd3f3f1",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
    "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
    "sha256:eec097a6cebd16fffbbf307acf30958ffc67e43008de878eabeb31c1edaa1d88",
    "sha256:19836acebdf7f335811b367658e79c743db538d86a6d12e566b533bf66070e4a"
   ]
  },
  {
   "name": "sha256:03e992572593988e09c37b48f94307b2b4c79f2ed961b0d2a6eba7bef9233bc5",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:03e992572593988e09c37b48f94307b2b4c79f2ed961b0d2a6eba7bef9233bc5",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
    "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
    "sha256:c7a47ce47a9958c3fa1633bea7f8dffd8fadd95798438b2f7a1fae256c8b5940",
    "sha256:69da13aaf80f3462ea9c8bbfbad0c6e9c7e70dc11d90363d8de1a103b21f285f"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:004362f4560a23975e9b453d18da6ddd99d4131589952b395b84df49cb125f8c",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:004362f4560a23975e9b453d18da6ddd99d4131589952b395b84df49cb125f8c",
   "tagSymlink": "54f96e30",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:cc200547f588bba56d2a0c54f62dcb95ce08db1be4289f43bc66d56cbb8aa9c4",
    "sha256:56a7857ecba3bfc6170950f06d156b79feee36f961670d81457339d1cbe9fbaa",
    "sha256:d6959fc60179ff800de7a4380f4f759237774636571c299169ecf5b42bd3f3f1",
    "sha256:03e992572593988e09c37b48f94307b2b4c79f2ed961b0d2a6eba7bef9233bc5"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:3658954f199040b0f244945c94955f794ee68008657421002e1b32962e7c30fc",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:3658954f199040b0f244945c94955f794ee68008657421002e1b32962e7c30fc",
   "tagSymlink": "2657ea06",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:3df935837634adb5df8080ac7263c7fb4c4f9d8fd45b36e32ca4fb802bdeaecc",
    "sha256:2d8319a33aa781918a3173e2061635d8534cc5e4a39171775830ff7e2ce646ac",
    "sha256:9ed69f7ca0d8a273ecc777332cb2cd7f87c8ec340192fd62381ae7cc0c2cc40c",
    "sha256:45e2301078f2237ddb7147d2761c94ad2ec1e95a79c2120ef5d9d97270a5494b"
   ]
  },
  {
   "name": "sha256:3df935837634adb5df8080ac7263c7fb4c4f9d8fd45b36e32ca4fb802bdeaecc",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:3df935837634adb5df8080ac7263c7fb4c4f9d8fd45b36e32ca4fb802bdeaecc",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
    "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
    "sha256:b3ab75b621f05b60d60c8297db620b289f26ea50d706d4617574a4ed5967ec5c",
    "sha256:eb9d5c9681cd5609e14c7ef072925d3e797b25ae23cf300ca0466224f9b4d23e"
   ]
  },
  {
   "name": "sha256:2d8319a33aa781918a3173e2061635d8534cc5e4a39171775830ff7e2ce646ac",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:2d8319a33aa781918a3173e2061635d8534cc5e4a39171775830ff7e2ce646ac",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
    "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
    "sha256:846e2012e7aea7302d76838b0eb599f1605138e22fbeb1c494413e28b5534ec6",
    "sha256:1b1364165968e37f00f814d0f48257dc7a86a260e9f3b032ead712dc56f90702"
   ]
  },
  {
   "name": "sha256:9ed69f7ca0d8a273ecc777332cb2cd7f87c8ec340192fd62381ae7cc0c2cc40c",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:9ed69f7ca0d8a273ecc777332cb2cd7f87c8ec340192fd62381ae7cc0c2cc40c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
    "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
    "sha256:17268e31a0438ca2bfcfb6bb9d25198aa90c8396a1806ba68c2b8324a233faa7",
    "sha256:7b5a80e576e70ccee98a4d75bafe3feeb50793096ec5e2500997ce5b805c0a35"
   ]
  },
  {
   "name": "sha256:45e2301078f2237ddb7147d2761c94ad2ec1e95a79c2120ef5d9d97270a5494b",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:45e2301078f2237ddb7147d2761c94ad2ec1e95a79c2120ef5d9d97270a5494b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
    "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
    "sha256:e7983e5cc7d187e5cd9e590bf6376de61219917bfbe4d0451ab9a425d81b36fd",
    "sha256:2be97eb64495c9b1fa1b8f4079430301cb7d3d8eb4b6aa52af6d3fa73eada065"
   ]
  },
  {
   "name": "sha256:05816da29dd5410e32fbb0f1fae27961efa2ac5f166fcf355b5f5e3beb584e54",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:05816da29dd5410e32fbb0f1fae27961efa2ac5f166fcf355b5f5e3beb584e54",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
    "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
    "sha256:64ea5da000168bda49627e21402d3267112ad8bd59c962033a4f01dc665ba4aa",
    "sha256:641f32d3d2370739400c16d06e703704f0318cce31348f96ef727fcb219b77ee"
   ]
  },
  {
   "name": "sha256:112fa4f0f8a5760f1cd8891d53621a3ea3e7074fb923916e730dbb9848e2d5bb",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:112fa4f0f8a5760f1cd8891d53621a3ea3e7074fb923916e730dbb9848e2d5bb",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
    "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
    "sha256:bedae5874309518121a9cf7450f87b7ba9b628db6fca65982400ca6f7e393f9c",
    "sha256:09a39b6f77c1f6e56effdf137c29aea153f4d1532d9d93ef60d470b6e60a1c3b"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-attacher@sha256:cdaf874ffaff5e3e4cae473c40372ef45f7d9e3bb35a93c7a715bcc30ff03a4f",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:cdaf874ffaff5e3e4cae473c40372ef45f7d9e3bb35a93c7a715bcc30ff03a4f",
   "tagSymlink": "551003b7",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:5a25a26071fa9bc47fc225a7094c5766d2b5ba5672f50fef74b6ca42386d08c9",
    "sha256:7c7cded451ce5a9af3126e7f7cd85824c3272a734214c7d14340264ba5e9b342",
    "sha256:05816da29dd5410e32fbb0f1fae27961efa2ac5f166fcf355b5f5e3beb584e54",
    "sha256:112fa4f0f8a5760f1cd8891d53621a3ea3e7074fb923916e730dbb9848e2d5bb"
   ]
  },
  {
   "name": "sha256:5a25a26071fa9bc47fc225a7094c5766d2b5ba5672f50fef74b6ca42386d08c9",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:5a25a26071fa9bc47fc225a7094c5766d2b5ba5672f50fef74b6ca42386d08c9",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
    "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
    "sha256:6d7baa693c3895cad8350e338f5cc9430ce326532db5fa8a98e1cdb8901c0b67",
    "sha256:3f0277141d7795bd46918ca38eae4fa12dea1837ac42bc356b8deecb4efc0631"
   ]
  },
  {
   "name": "sha256:7c7cded451ce5a9af3126e7f7cd85824c3272a734214c7d14340264ba5e9b342",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:7c7cded451ce5a9af3126e7f7cd85824c3272a734214c7d14340264ba5e9b342",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
    "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
    "sha256:696fb007438d9d637a3bb393b77977c4c1676861fe4f2cc66bf76705f337b8ff",
    "sha256:4559af5adfad4252fd9da4de7da41b00169750ca6797cbbebfb1f62a44a3afa0"
   ]
  },
  {
   "name": "sha256:4ed1db89bdd6150f28721a3c18bcfa7e221b1b621c12ae8830fd35923dea08ca",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:4ed1db89bdd6150f28721a3c18bcfa7e221b1b621c12ae8830fd35923dea08ca",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:2cbc2866f0e2741aa3c72c6a699db0f8b25a5a5fea7d49ee2aa4f9a97ec6ee4c",
    "sha256:17e3a5f768e10e019b5bf765f63f8f9243bdfc7856b6c5b92b2b93430a7a91e7",
    "sha256:9171aef8701e941ef919fc22322282382714b67e64a53252a5ee2f179769f4ce",
    "sha256:e167207bb45f8218a9988bf503cc101cc7a76e7f4770b1e62ccb3cd19f75ebfa"
   ]
  },
  {
   "name": "sha256:f2a35675f04b3852dadbea99fef57dcc85ab5670929f7b0d52981e227047123c",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:f2a35675f04b3852dadbea99fef57dcc85ab5670929f7b0d52981e227047123c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:bdee7855ef43f1c1d40221634c315c1998e5ee6f976d77dec4834f669bee371d",
    "sha256:df8985aa78d66ad0ca1e65cdf78c0a770212de626074c34770d25b8dcfc5e4bf",
    "sha256:0a1de9f30b5b86a3d2847eb4ce3a8dd4349695494b85a7f1990f40bc2c8242ba",
    "sha256:3b3e9f3d7c585aa8e61318f85327abee55143a9047afdf41407312b27292e4e2"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:4ff2d65ea16dd1026fe278a0f8ca920f300dfcee205b4b8ede0ab28be1aa43a6",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:4ff2d65ea16dd1026fe278a0f8ca920f300dfcee205b4b8ede0ab28be1aa43a6",
   "tagSymlink": "80537000",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:4338ea20fce25b664e880066144a5de7769623373cbfde1f46666aace4d9b855",
    "sha256:4ed1db89bdd6150f28721a3c18bcfa7e221b1b621c12ae8830fd35923dea08ca",
    "sha256:f2a35675f04b3852dadbea99fef57dcc85ab5670929f7b0d52981e227047123c"
   ]
  },
  {
   "name": "sha256:4338ea20fce25b664e880066144a5de7769623373cbfde1f46666aace4d9b855",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:4338ea20fce25b664e880066144a5de7769623373cbfde1f46666aace4d9b855",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3de00bb8554b2c35c89412d5336f1fa469afc7b0160045dd08758d92c8a6b064",
    "sha256:c530010fb61c513e7f06fa29484418fabf62924fc80cc8183ab671a3ce461a8e",
    "sha256:17f3bc201fde99cc5e67b378fb79e032d5d79274422ec34589b7418927debd79",
    "sha256:22be94f7d9c863e9133909fb0b3c166baafd5020df53e9832e3f04aebfa74745"
   ]
  },
  {
   "name": "sha256:11d03e12451b549eab21f314cf0f0e6618eaa6059762e12c9c98b0af6f774eaa",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:11d03e12451b549eab21f314cf0f0e6618eaa6059762e12c9c98b0af6f774eaa",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
    "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
    "sha256:95736960492113cf6f57b057e0bd5bec485e84a32bcfd087afa88452078e4cbd",
    "sha256:0dae53999ce2826ad4f72434e2c655db99c93328841e3879d4f2edf6b7723ad7"
   ]
  },
  {
   "name": "sha256:52eac073361e7888baae963abe32b5331701b7aa6c80a8d9ea1ebd3370fcb105",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:52eac073361e7888baae963abe32b5331701b7aa6c80a8d9ea1ebd3370fcb105",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
    "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
    "sha256:82bc3e338c6caac36f01df11719e918f944040f849683e8871caa12d9134a197",
    "sha256:77c5578555fabd2d05ac8d75223d50a7f42592997d6845f1d2b5d7dc3f85c11e"
   ]
  },
  {
   "name": "sha256:8e5c388d11228105aa69ab8aa6dd5b49b1b51a6effd9c44feff3fcdcf9e1d5b4",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:8e5c388d11228105aa69ab8aa6dd5b49b1b51a6effd9c44feff3fcdcf9e1d5b4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
    "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
    "sha256:5a13aec661b7876e73db8bae7a096cf1ef7a6ea1d281820fcd2808affa754cf9",
    "sha256:154cf2429f7c806aa6a5723a7970b5f9d76779b59d9afe427a2df6f62a0e812d"
   ]
  },
  {
   "name": "sha256:9dff38526f0ac825b58f466b0d6bc4954bc5d401c7faa8d10de6c69e0a9b2720",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:9dff38526f0ac825b58f466b0d6bc4954bc5d401c7faa8d10de6c69e0a9b2720",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
    "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
    "sha256:a1973e30290f3dc67ce1c09f0e29b6e57540ebf0172fe8b46a5e9036453d0a35",
    "sha256:ec8ef51d30631cd93c74db851d69bedb846bdacf6d5e752f2e8cd69e77f205d1"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-node-driver-registrar@sha256:90792483c531bfa2c51e5be45efdc0e52e3e2461a4c9a6921428d719415dc8b0",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:90792483c531bfa2c51e5be45efdc0e52e3e2461a4c9a6921428d719415dc8b0",
   "tagSymlink": "88c12bdc",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:11d03e12451b549eab21f314cf0f0e6618eaa6059762e12c9c98b0af6f774eaa",
    "sha256:52eac073361e7888baae963abe32b5331701b7aa6c80a8d9ea1ebd3370fcb105",
    "sha256:8e5c388d11228105aa69ab8aa6dd5b49b1b51a6effd9c44feff3fcdcf9e1d5b4",
    "sha256:9dff38526f0ac825b58f466b0d6bc4954bc5d401c7faa8d10de6c69e0a9b2720"
   ]
  },
  {
   "name": "sha256:0dcb115c44c0436ae63d5fe8d8b97c3e8c05b5698f19e13062306c43425ab55c",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:0dcb115c44c0436ae63d5fe8d8b97c3e8c05b5698f19e13062306c43425ab55c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
    "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
    "sha256:ed56fdd98f16b922b32fcb6ce609abcf8f70d5968db9dadf4c8ccabf9f388395",
    "sha256:967e8ab8765664c6a1352cdb227a8b1703349bd922f50842fa50b500ceb5f6ac"
   ]
  },
  {
   "name": "sha256:734b0117da2be59627b732b119a0726bb9208779b9ecb77e94bb4656d5dfe1ee",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:734b0117da2be59627b732b119a0726bb9208779b9ecb77e94bb4656d5dfe1ee",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
    "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
    "sha256:14f15a66b96e4129cafaf3b9819c3b377bf3e5ce56d8aa00f909cd9f6931bacf",
    "sha256:b547b35a6955eda95987a9626ee0746e605463c4f94575aa2d7adfb3750076c4"
   ]
  },
  {
   "name": "sha256:345e5c9f20d392840131bbb5513d96011d48a9cde091495cb3bb6912032ac3ce",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:345e5c9f20d392840131bbb5513d96011d48a9cde091495cb3bb6912032ac3ce",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
    "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
    "sha256:d7045eae6268136660f80f241fb798547af2f9882c05b74c9e0daf923699ca3c",
    "sha256:ade93b476890fc97e5fe4f32a051159854f0e2a0bc51e3f31cea1574fd0d2bfb"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-snapshotter@sha256:8aba608ee3fcca4a1e0cef679fd61778cc071a91871bb6146eb46b38bae22260",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:8aba608ee3fcca4a1e0cef679fd61778cc071a91871bb6146eb46b38bae22260",
   "tagSymlink": "61ad6590",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:69bcfc204958769d7ca0c7d239e3f9b4ae13c55f6de969006bbdd62c11554de5",
    "sha256:0dcb115c44c0436ae63d5fe8d8b97c3e8c05b5698f19e13062306c43425ab55c",
    "sha256:734b0117da2be59627b732b119a0726bb9208779b9ecb77e94bb4656d5dfe1ee",
    "sha256:345e5c9f20d392840131bbb5513d96011d48a9cde091495cb3bb6912032ac3ce"
   ]
  },
  {
   "name": "sha256:69bcfc204958769d7ca0c7d239e3f9b4ae13c55f6de969006bbdd62c11554de5",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:69bcfc204958769d7ca0c7d239e3f9b4ae13c55f6de969006bbdd62c11554de5",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
    "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
    "sha256:edeb746e57a257eab7cf3823293cf3954610a0a921421fc7e3569fce5bcbd4ca",
    "sha256:bd8f0f0bf06cb7bb66e1104c07ba3cb2d01d5aaa5e378f7c9b83bca4a92b7002"
   ]
  },
  {
   "name": "registry.redhat.io/rhel8/postgresql-12@sha256:81d9bf20387ecfa85bf24dd53167242393075544a4368636a4bbda79d8769f49",
   "path": "rhel8/postgresql-12",
   "id": "sha256:81d9bf20387ecfa85bf24dd53167242393075544a4368636a4bbda79d8769f49",
   "tagSymlink": "e4bfb87a",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:1896ab7cbfc4ade742b23ca45f410a1c58a520095c2507619c3346afec125ecc",
    "sha256:013d9491ebfcc75974b26be0190c3eebe83c2546ea633f2076cc53095447bd35",
    "sha256:e9bb1955d0ae13cd0b57f426cf510e1e25aac8abf0ad3230b70484dfdce46865",
    "sha256:559305a63c719d170e76746bffb2ce15cde7f4e1fd9380d384508d72d0d52516"
   ]
  },
  {
   "name": "sha256:1896ab7cbfc4ade742b23ca45f410a1c58a520095c2507619c3346afec125ecc",
   "path": "rhel8/postgresql-12",
   "id": "sha256:1896ab7cbfc4ade742b23ca45f410a1c58a520095c2507619c3346afec125ecc",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0c673eb68f88b60abc0cba5ef8ddb9c256eaf627bfd49eb7e09a2369bb2e5db0",
    "sha256:028bdc977650c08fcf7a2bb4a7abefaead71ff8a84a55ed5940b6dbc7e466045",
    "sha256:c37fd7de0840b4031b29e532b9c694c59a63983ae93162a2e6476882cd075b21",
    "sha256:eb55064625198fee2c7b102ec4a86e8f3110864a72f45041fd78aa10686f9ae7",
    "sha256:da3d006ac2e20d38e2b4e63ded82e410a21d6fd69644bcabcb77eb724b28c1c0"
   ]
  },
  {
   "name": "sha256:013d9491ebfcc75974b26be0190c3eebe83c2546ea633f2076cc53095447bd35",
   "path": "rhel8/postgresql-12",
   "id": "sha256:013d9491ebfcc75974b26be0190c3eebe83c2546ea633f2076cc53095447bd35",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e0444ce29df7b754434fd4557ec395c5a1759e4af71c3615a81471e0c7edeadc",
    "sha256:18ea5ce2a404500d5dfadf661ec0566faf7380e56b05ed37735b93844ed5faaa",
    "sha256:a1acc2fd53cd4b8369b226d144c216d25d9c1a380745768f496afbc3f48a1298",
    "sha256:3b395c8c1e1a887da992d3fe67608386c765d39dc9c021ae9d50073d63053fcb",
    "sha256:5e4093b5f995d8570e4f76f901e1bad01dd1ef2472faecfa3ffbe968cf1ae71e"
   ]
  },
  {
   "name": "sha256:e9bb1955d0ae13cd0b57f426cf510e1e25aac8abf0ad3230b70484dfdce46865",
   "path": "rhel8/postgresql-12",
   "id": "sha256:e9bb1955d0ae13cd0b57f426cf510e1e25aac8abf0ad3230b70484dfdce46865",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:7472fa517fd188919c3ff6ec27806dd20311bb57e1e34a7f3998734688fa7b42",
    "sha256:9f6eca53e5bceb7b88b4c078cc5d939e61d13301d8bdccb6b68eeea4d3879f3e",
    "sha256:c54fd38fa8e85b2fb449666efa98198e9664b52a6f3602c0a4a8667186f12b99",
    "sha256:586b16a4389b3b03acd8a98cbea0760370b1b4f1252a343fd9690a236798a403",
    "sha256:a17692caa614cc975b3c585687f9de1bf8f08102c4090c9978bbbe65b9e62c53"
   ]
  },
  {
   "name": "sha256:559305a63c719d170e76746bffb2ce15cde7f4e1fd9380d384508d72d0d52516",
   "path": "rhel8/postgresql-12",
   "id": "sha256:559305a63c719d170e76746bffb2ce15cde7f4e1fd9380d384508d72d0d52516",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:744db8e918c5c882f601488dcdbe3c4e9fa01913fe57119975eb5b16a18f6250",
    "sha256:d851aca55b090483dcda2af05dbf048848399647d96dd3d4089f92d35f827db7",
    "sha256:1ec3039ee2083ddda0023477b8b6ce4953997b4ca67abdeae1be577be165745a",
    "sha256:af93f624f4a84ab6ad66020b46c4ca4733cc4a6c22903e1e3147ca5c85e88821",
    "sha256:ee297db47bdb3c82fa42aec2c69bee6f395c8bb32c21037e054e3bdce776d763"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:bc2cac50a38866218646cb8b9af10cc8fa03cb01467878ebf412e783150350ea",
   "path": "odf4/odf-operator-bundle",
   "id": "sha256:bc2cac50a38866218646cb8b9af10cc8fa03cb01467878ebf412e783150350ea",
   "tagSymlink": "b4b16a7a",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:75719a72b1f2b33be1841ec0220c3ffec3bbbf23d5faf2d3c2369a3d73bf2643",
    "sha256:9c56b3e6b0c37fa3f823e8877e08e23a895f2b64644af1b704af30555192789e"
   ]
  },
  {
   "name": "sha256:bc6c190459f11fe66de8a36d21b950e240e3f074edd1f1bc2b12c0fd2c2d0867",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:bc6c190459f11fe66de8a36d21b950e240e3f074edd1f1bc2b12c0fd2c2d0867",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d3b9a4a690bf1791b874c3495c6a8e2c039150b5882374cd9c42dd4bba68ba31",
    "sha256:a049ed70eeb87542c711449e14b6a7ccdde9ca2219d749fa0872aa755f2a89cb",
    "sha256:e60835077d2634006c80c65eb8c91a891fd0ba325ad9d512792f25579b8f5f9f",
    "sha256:b944243f8e37505bd9d6ba730425b66ccf8951a684364318ff324a15ceb606a7"
   ]
  },
  {
   "name": "sha256:a4e20b4042cbc2c0eeeb802c4afdd89955cdc36109357dd8339ffb55565fd893",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:a4e20b4042cbc2c0eeeb802c4afdd89955cdc36109357dd8339ffb55565fd893",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:02863a09124c1837ee0672a011fb7e2d5c95ae16af6b569f65d2e0f763127ddc",
    "sha256:97aead8e17dadf7e07e5153ee6d5a68d28e46847e01db6d9325742076043fd20",
    "sha256:2adb09105a7be697913af3405b729f187eb0c5ad85cf44042388b240cfdab07c",
    "sha256:e9b026ac67129a48423433350ec0cbe66ca75267785ad722b0a6e404c09d2cb9"
   ]
  },
  {
   "name": "sha256:25029b77d58b4b953a80c083dae16de2a444ea7d0acb76ca362a1a70cc5dc9f1",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:25029b77d58b4b953a80c083dae16de2a444ea7d0acb76ca362a1a70cc5dc9f1",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:220d447748c8866cbfeac8fb3534dd8d49cc8b99cc625041414c17d0f80e02ca",
    "sha256:8909629d32e7d0fef085a5fcee0e0f318367006d81be0d5da8e0a209ee230793",
    "sha256:630667c86246798272e16bf55d043b4f2f7b85115322e4388607c4bd5c6fd9f8",
    "sha256:35b03c6be04735bf69759b256843e402abd39b04359d491cd045cce30d637d45"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:a295b5db13342aa596d8936615b80df86259a0658a4190bd66453df1db450cae",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:a295b5db13342aa596d8936615b80df86259a0658a4190bd66453df1db450cae",
   "tagSymlink": "a7efffb",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:bc6c190459f11fe66de8a36d21b950e240e3f074edd1f1bc2b12c0fd2c2d0867",
    "sha256:a4e20b4042cbc2c0eeeb802c4afdd89955cdc36109357dd8339ffb55565fd893",
    "sha256:25029b77d58b4b953a80c083dae16de2a444ea7d0acb76ca362a1a70cc5dc9f1"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-operator-bundle@sha256:be095b227df301a7067f1663405faf2b984441613f14576606b98c781f0353dd",
   "path": "odf4/odf-csi-addons-operator-bundle",
   "id": "sha256:be095b227df301a7067f1663405faf2b984441613f14576606b98c781f0353dd",
   "tagSymlink": "fdf236e6",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d580196089a3ec7c23cf23e84dd2f233f262941cfb45bd802e54e4ce4748fa08",
    "sha256:0c805426bac6794c96c57ea0f25bee2ea82703df48ec5da99d01bd1b73cf458a"
   ]
  },
  {
   "name": "sha256:de5e00dfb7b4deff09ab7fc83894c274d09990dc066f7b3b207c0071d9e0ab00",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:de5e00dfb7b4deff09ab7fc83894c274d09990dc066f7b3b207c0071d9e0ab00",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
    "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
    "sha256:787758a4a3596c5eb023c3f375a8f583ec7af27d4ee8997aa4e681812e81af0e",
    "sha256:3629eb29ccd3049d5919ea3ed69950210f6f1283fa25606b398fa0a09ed38163"
   ]
  },
  {
   "name": "sha256:f68a055e6538d9b2b04a13ca543ca8f72ed3a659f518862bc57787239ca7cdb8",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:f68a055e6538d9b2b04a13ca543ca8f72ed3a659f518862bc57787239ca7cdb8",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
    "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
    "sha256:a251eefb4b6c566939e05b499812793c3ad7c9e4ab2642db523fb083d103fae3",
    "sha256:cbd5d0bfc977f2bd1ef987d7774923fd5b2366203339ce968e292fda65972496"
   ]
  },
  {
   "name": "sha256:b962c27b8c5a7241769866984403b70242cddb2981ac00805cd06db102bee19c",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:b962c27b8c5a7241769866984403b70242cddb2981ac00805cd06db102bee19c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
    "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
    "sha256:56265dee362ffe166792541357a9185a17159870f8d62de3ea127c2561f419fb",
    "sha256:213d27f9fed8a6285d38d539876a7da2e67a93326783b31c992665059c194677"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:522a3496e76a921df258f09509e8532ad963fedbc74c282b6e412e0cce7c2f28",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:522a3496e76a921df258f09509e8532ad963fedbc74c282b6e412e0cce7c2f28",
   "tagSymlink": "5debde69",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:de5e00dfb7b4deff09ab7fc83894c274d09990dc066f7b3b207c0071d9e0ab00",
    "sha256:f68a055e6538d9b2b04a13ca543ca8f72ed3a659f518862bc57787239ca7cdb8",
    "sha256:b962c27b8c5a7241769866984403b70242cddb2981ac00805cd06db102bee19c"
   ]
  },
  {
   "name": "sha256:0c8d8a66c04b95606cdaa8e1e306fb8877a1c0453aa7a33f578b32effa7fc150",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:0c8d8a66c04b95606cdaa8e1e306fb8877a1c0453aa7a33f578b32effa7fc150",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
    "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
    "sha256:eac25aa7849e3bda5bf5dd99c6c5293dd54ee558aef81fc17fa0d44f14c282c2",
    "sha256:487c72010d13a3bbbeec2874c48809ef722ba298bfe133a3bbec65f8bd98a33d"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-resizer@sha256:75017593988025df444c8b3849b6ba867c3a7f6fc83212aeff2dfc3de4fabd21",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:75017593988025df444c8b3849b6ba867c3a7f6fc83212aeff2dfc3de4fabd21",
   "tagSymlink": "35a2fd67",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:357b2ae6eaca4596feaa1fcacba7b5083e954eea56d210f60abcb438f343d49d",
    "sha256:5ed2154c02436fbbe158b4cb821462aa4e1f5ea6e94566731a9c0f9954c23c4b",
    "sha256:4ca2a88d3065293ccb8827ae2f4d0e515d16fda75f86636e0d3a1a45e1353083",
    "sha256:0c8d8a66c04b95606cdaa8e1e306fb8877a1c0453aa7a33f578b32effa7fc150"
   ]
  },
  {
   "name": "sha256:357b2ae6eaca4596feaa1fcacba7b5083e954eea56d210f60abcb438f343d49d",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:357b2ae6eaca4596feaa1fcacba7b5083e954eea56d210f60abcb438f343d49d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
    "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
    "sha256:4cc89ef4c3da3e098416d0530cd0054e3d777b6f89c4dc4ec564859b6418d865",
    "sha256:ffee6b6e833e383ca04a3f97d8acb18e247ac745ae2f4c52675e05e09c1f6e16"
   ]
  },
  {
   "name": "sha256:5ed2154c02436fbbe158b4cb821462aa4e1f5ea6e94566731a9c0f9954c23c4b",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:5ed2154c02436fbbe158b4cb821462aa4e1f5ea6e94566731a9c0f9954c23c4b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
    "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
    "sha256:c186f885c19db339adc10e2fdbbfd05d8e515a581b6385f814159c9e4772deb6",
    "sha256:f8b5c613ea0daef779c153fb03eafd6c19645eff15c2ab779623caa4ca1c2ceb"
   ]
  },
  {
   "name": "sha256:4ca2a88d3065293ccb8827ae2f4d0e515d16fda75f86636e0d3a1a45e1353083",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:4ca2a88d3065293ccb8827ae2f4d0e515d16fda75f86636e0d3a1a45e1353083",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
    "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
    "sha256:d6ed18b71d246f2f31ad352782ba18f631a0f33f125d47cd06db187ec359bc99",
    "sha256:32134eca52f0181b3691a4610b0d76eda634e241f861322efb04bd1a8c29ac41"
   ]
  },
  {
   "name": "sha256:602c5e023667e31d9e779c7c1d37a26c22ca6a36d909510620a047cfd898b406",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:602c5e023667e31d9e779c7c1d37a26c22ca6a36d909510620a047cfd898b406",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
    "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
    "sha256:5493396eeb4ec100805cf34cd1a0ba6dea547ed09b943a76911130a996530f2a",
    "sha256:31bdf7ffadcbc577aedaf11f0e559c579395e2317b8cf23bec8540046b39f57d"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-resizer@sha256:519a0e644866b001f1b975ec05fd271f73c27bd45f713746e812e7827b6770c9",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:519a0e644866b001f1b975ec05fd271f73c27bd45f713746e812e7827b6770c9",
   "tagSymlink": "b29c7fa2",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:3d8ec1ae4a0601215900a844787182eb1298528472c8cffa824a31a9f10c8a7b",
    "sha256:34cec4367e440fad721be18fa1e9d0db205bb6ed062b3fac6a5dd4e28b09a8ff",
    "sha256:49c58a5d51f05446e248b587689aefb9cf67e074a5851979d4139de42043badc",
    "sha256:602c5e023667e31d9e779c7c1d37a26c22ca6a36d909510620a047cfd898b406"
   ]
  },
  {
   "name": "sha256:3d8ec1ae4a0601215900a844787182eb1298528472c8cffa824a31a9f10c8a7b",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:3d8ec1ae4a0601215900a844787182eb1298528472c8cffa824a31a9f10c8a7b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
    "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
    "sha256:9637136331026232820cae9762b477dcb7bf17237d77ea4fde6ea3a197c1458f",
    "sha256:441f73b5613af96297573590a2aa41e5a789f0a89d5ccbe35a446125e8f93387"
   ]
  },
  {
   "name": "sha256:34cec4367e440fad721be18fa1e9d0db205bb6ed062b3fac6a5dd4e28b09a8ff",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:34cec4367e440fad721be18fa1e9d0db205bb6ed062b3fac6a5dd4e28b09a8ff",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
    "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
    "sha256:3814be84c20669ecdf132c0ce1c2dc9312a641b0fbbdcc172d25c7cd6e85a5e3",
    "sha256:2602a9c069fa21f42aae80270e728d3c520309c39533d34be5436690cf029011"
   ]
  },
  {
   "name": "sha256:49c58a5d51f05446e248b587689aefb9cf67e074a5851979d4139de42043badc",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:49c58a5d51f05446e248b587689aefb9cf67e074a5851979d4139de42043badc",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
    "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
    "sha256:73b9e7ec2bde4a770be0d35a70d0d43af4c67000c71120e6169083c60a3f46c3",
    "sha256:5b4c7acd18bdde3a983ec40a1e238566a283cd760d6e38f379131c3aff73f9da"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/metallb-operator-bundle@sha256:192103f9feb021cf2e6d21f9e7c390ee8bf43b6ea23835eb700f84e8d192f392",
   "path": "openshift4/metallb-operator-bundle",
   "id": "sha256:192103f9feb021cf2e6d21f9e7c390ee8bf43b6ea23835eb700f84e8d192f392",
   "tagSymlink": "33c225dd",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:7a45969f81c70bb6859db32edf9711c42514bf32e7203733b7e02a0f05c2df94",
    "sha256:e6d5906b8b06f4b8a2b2f8fd70a71c6df17faa69a8d92c51ebdafb56f48b6730"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:18da22ffcea86ef09c61d20ae81cd6f82cbf73c292dc4ef206dfd976ec7c5971",
   "path": "odf4/ocs-operator-bundle",
   "id": "sha256:18da22ffcea86ef09c61d20ae81cd6f82cbf73c292dc4ef206dfd976ec7c5971",
   "tagSymlink": "13bba01d",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:9ca210d03e3f17483b2576813bb4c16b673930f490f042ae66bdbd15d4be2972",
    "sha256:ccfed63053e23dc6f991a24cb6cf113ddceb21c48154e5fd98b216440ab6252b"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:9a029ef220e1ff32bdb95be3221803d68f3550fdb2a75a241adf89b447636e43",
   "path": "odf4/mcg-operator-bundle",
   "id": "sha256:9a029ef220e1ff32bdb95be3221803d68f3550fdb2a75a241adf89b447636e43",
   "tagSymlink": "54dca07e",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:5a24b559d7fcba235c62f82a22aee85c5140230813a744fc43153b1d074fba35",
    "sha256:ce751eb60f2b4522435b3e30d92deba8bdbf08941a29df4aee57f42ef1157960"
   ]
  },
  {
   "name": "sha256:7da72672ed9f83988c559614794b5368093e28de7ec218a793b103c86be1490b",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:7da72672ed9f83988c559614794b5368093e28de7ec218a793b103c86be1490b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:661f8c7fec3094a509f67e483b6aa71612adc4fa44a011d68524c65fcd9e226f",
    "sha256:0a66d8076c9db262c20586a7e350914f3b101008366a97e58c6d85bcf3311efa",
    "sha256:59c1a3bee3423e7ba1adeed70a618ebbe72fdd4bebce56e6bff11342c2fe8941",
    "sha256:a588a26919750eadccf7316406ad8da242ea795bc9f84e053a3e3d2eaee51b64"
   ]
  },
  {
   "name": "sha256:57d765f210d5aadc288a5ea5b8229effd18874e10ba7ae6a5fbbe53d745796e5",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:57d765f210d5aadc288a5ea5b8229effd18874e10ba7ae6a5fbbe53d745796e5",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e3e51c76147a5eb97c0cbd60ce298c9ee459790888cc11a4dbba3e0f7ba0c5d1",
    "sha256:edfd1b5d7e75a67aba56631ee915129d44d1557bf3110ee605728a8002b34d23",
    "sha256:e3ea1e8005cd0ae31880d7cc7f58965bf15f5ded21d765403594380f6c635955",
    "sha256:8a69e40d5bb18d9eb5264feb27b4eef0930a11af7da2484c98119d2ccd8f023e"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:0f23899af9031663308ea7501b35236387238567bafd5d10295bc4726f45c2ae",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:0f23899af9031663308ea7501b35236387238567bafd5d10295bc4726f45c2ae",
   "tagSymlink": "56010884",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:d7f0286b395ff43611c591c1406a2f37821246a5543d24acfb92ccf622384fba",
    "sha256:7da72672ed9f83988c559614794b5368093e28de7ec218a793b103c86be1490b",
    "sha256:57d765f210d5aadc288a5ea5b8229effd18874e10ba7ae6a5fbbe53d745796e5"
   ]
  },
  {
   "name": "sha256:d7f0286b395ff43611c591c1406a2f37821246a5543d24acfb92ccf622384fba",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:d7f0286b395ff43611c591c1406a2f37821246a5543d24acfb92ccf622384fba",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:a9e23b64ace00a199db21d302292b434e9d3956d79319d958ecc19603d00c946",
    "sha256:38b71301a1d9df24c98b5a5ee8515404f42c929003ad8b13ab83d2de7de34dec",
    "sha256:938cfe696c14eb0b980d1c1e314cc44561d1d328a0ba693b2f79154bb31fd4da",
    "sha256:d323687ab7ab077967acda87e0283acce6355497152ad6527b96eaaf145a0b86"
   ]
  },
  {
   "name": "sha256:c53e6cb927dc1d241f1466f3d11af80fe64a89a48c215e11c65cb04e08cf35fb",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:c53e6cb927dc1d241f1466f3d11af80fe64a89a48c215e11c65cb04e08cf35fb",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92491c8a90cf467336f6e7d283809c4de69e0141bdcf17c023b1edf310c8f678",
    "sha256:be2d37fed3de60e335e761ccc650ef174a17f8be5660b42bc5cc227b557aa13c",
    "sha256:7abf236008b38b739c5178765362c77c2427574653958b783256087e07e9b5e8",
    "sha256:7189446c989ba197b887fac29b598ed60c5fa98d36977ca0ed714d477efde643"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:4860ed22df4ac49573bcf2434266585ba48ff33c8f25ec2a36f616bd349c4e25",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:4860ed22df4ac49573bcf2434266585ba48ff33c8f25ec2a36f616bd349c4e25",
   "tagSymlink": "295685fc",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:73fac885482871f744fcf2e5635be1e10d812845ba122d30446641f11d436099",
    "sha256:4ea80063a33a0524cffd54d2ee915332cd0bfafe8e448d1c283a9c80f46b8471",
    "sha256:c53e6cb927dc1d241f1466f3d11af80fe64a89a48c215e11c65cb04e08cf35fb"
   ]
  },
  {
   "name": "sha256:73fac885482871f744fcf2e5635be1e10d812845ba122d30446641f11d436099",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:73fac885482871f744fcf2e5635be1e10d812845ba122d30446641f11d436099",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:510abfcdf6bce7517c9dbde8fd24c03d8f36fe1503f65a712f824401f857aac7",
    "sha256:4a3604715398d774a2abb75d31b035aa4099557f7016e27550cefc9759368cda",
    "sha256:43dcf74e6c1f183a4e79e837e8095c1e81efde28deeaaba85661cc0da98aedb8",
    "sha256:c1c028ae728e2527272dc959d0d9af41037826cf4017d383a1e8361b85614ccb"
   ]
  },
  {
   "name": "sha256:4ea80063a33a0524cffd54d2ee915332cd0bfafe8e448d1c283a9c80f46b8471",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:4ea80063a33a0524cffd54d2ee915332cd0bfafe8e448d1c283a9c80f46b8471",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f2cdfe33b637eca2019910dbfd9c00211fe1aeda61fe42b23f08bb74a91e72f5",
    "sha256:6d9e8294c3485a103e1bccd5ab429804c39e30fa9217e9b8e15154afe93e3167",
    "sha256:6cebe0c84c6f9b5e9e189708c95b9b1d05caa3e89c5dfc25285c04b8e85e7ad3",
    "sha256:cdeb7de8f0cb98f055bc50b8a880d3a64482905cb9a7424e8ae486611e66b6b2"
   ]
  },
  {
   "name": "sha256:60133217c4f4d5cc1e778e92f7de31a527ff43846aaebe5db6dd5d9978d7c2fb",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:60133217c4f4d5cc1e778e92f7de31a527ff43846aaebe5db6dd5d9978d7c2fb",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92491c8a90cf467336f6e7d283809c4de69e0141bdcf17c023b1edf310c8f678",
    "sha256:be2d37fed3de60e335e761ccc650ef174a17f8be5660b42bc5cc227b557aa13c",
    "sha256:20d7418ab044bdb92959e004b595d8d867843bcc2ea72c0f8ee9a44aac0372b5",
    "sha256:d15de5879f6a27e8d65341e40e28e01b439e11c4f21c7a86d59d687fcdfe34ca"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:fe08ba03de51d04bdbc4ef4559106643b0ed422c26146c72069a2831f4bb08cb",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:fe08ba03de51d04bdbc4ef4559106643b0ed422c26146c72069a2831f4bb08cb",
   "tagSymlink": "3813e043",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:ad89936da3510643ac92087fedfc71965cb4b1e2e1845162f6e04eeb02b5f857",
    "sha256:3808e1084febf2ee4d32e2ae6334c4feb17c1ac57df3c30d514227514cbd4a2c",
    "sha256:60133217c4f4d5cc1e778e92f7de31a527ff43846aaebe5db6dd5d9978d7c2fb"
   ]
  },
  {
   "name": "sha256:ad89936da3510643ac92087fedfc71965cb4b1e2e1845162f6e04eeb02b5f857",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:ad89936da3510643ac92087fedfc71965cb4b1e2e1845162f6e04eeb02b5f857",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:510abfcdf6bce7517c9dbde8fd24c03d8f36fe1503f65a712f824401f857aac7",
    "sha256:4a3604715398d774a2abb75d31b035aa4099557f7016e27550cefc9759368cda",
    "sha256:dd957fcf0d58b6f221628fb5be23bb1b5816457a6094ef53927b10dce2e5fd38",
    "sha256:541c8159e97693673066cea66982536e861c65b4945ffbdab95ee7dbd16dcc45"
   ]
  },
  {
   "name": "sha256:3808e1084febf2ee4d32e2ae6334c4feb17c1ac57df3c30d514227514cbd4a2c",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:3808e1084febf2ee4d32e2ae6334c4feb17c1ac57df3c30d514227514cbd4a2c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f2cdfe33b637eca2019910dbfd9c00211fe1aeda61fe42b23f08bb74a91e72f5",
    "sha256:6d9e8294c3485a103e1bccd5ab429804c39e30fa9217e9b8e15154afe93e3167",
    "sha256:35a867e085375220d3ac53a71ee97a7f5337b3ab540cb57cc18d1a0289c6d9d5",
    "sha256:65c5495a2f8ea74c0589a188fe322f292f697af1723ad8f360125c757aefda0a"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/kubernetes-nmstate-operator-bundle@sha256:e1dde590c46e18be23d7c7f1b235d506894e790e118d32d74c6f90ae023c1bc2",
   "path": "openshift4/kubernetes-nmstate-operator-bundle",
   "id": "sha256:e1dde590c46e18be23d7c7f1b235d506894e790e118d32d74c6f90ae023c1bc2",
   "tagSymlink": "39899794",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:391caca0b71d28d42f451280c98651af417420b035474ee31dad659d5a533226",
    "sha256:d7b02170dfeb641171db5d25dc1ddad9f0ed48d643ba98eea057cacf4900d5c6"
   ]
  },
  {
   "name": "sha256:cbbefa6e573f826a2ecf8574e0cd46e845de9b31cdda74fdc9621be508fef3c6",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:cbbefa6e573f826a2ecf8574e0cd46e845de9b31cdda74fdc9621be508fef3c6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
    "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
    "sha256:3ba15d43afbde327717915464dfd74eb10b69903195113bec6c18e450773dbdb",
    "sha256:263623c4c4f945914af1efe5a02d4cab9d371687f1a6994cf7d4100127b08fc3"
   ]
  },
  {
   "name": "sha256:4b8142242a022d635b36abea1ae64aadebeed9ad0dd25852d6ace7dd818016f0",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:4b8142242a022d635b36abea1ae64aadebeed9ad0dd25852d6ace7dd818016f0",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
    "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
    "sha256:dcff36ed68c88a2bfcd3afbca628bc3717da5ab6e65d56640a6910fe19a12a6d",
    "sha256:012272a7579544eac03b6e9118d78b8b057f250b005e46b6ed08b89b7c14ba3d"
   ]
  },
  {
   "name": "sha256:480c819fa76d86eec8a89a70f3d30687ffcc52d1af792579ca73cf7d6b134f0e",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:480c819fa76d86eec8a89a70f3d30687ffcc52d1af792579ca73cf7d6b134f0e",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
    "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
    "sha256:6014771eacaaff55e67e287384f564c6d38032a09dedfbeff32c461655f20a77",
    "sha256:42a2a186d41e3765c539f75341282453c98baa13f1b56e570f4ffe202abd00ba"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-provisioner@sha256:0521f532c721ca946d802966633d9bc5bc08e642f3a765fee293b449441f90bb",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:0521f532c721ca946d802966633d9bc5bc08e642f3a765fee293b449441f90bb",
   "tagSymlink": "d8f70fd4",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:24cc533f1b81b8c79bd99bcfd8c7f94d07503591f46d53af8467002a4a6266a1",
    "sha256:cbbefa6e573f826a2ecf8574e0cd46e845de9b31cdda74fdc9621be508fef3c6",
    "sha256:4b8142242a022d635b36abea1ae64aadebeed9ad0dd25852d6ace7dd818016f0",
    "sha256:480c819fa76d86eec8a89a70f3d30687ffcc52d1af792579ca73cf7d6b134f0e"
   ]
  },
  {
   "name": "sha256:24cc533f1b81b8c79bd99bcfd8c7f94d07503591f46d53af8467002a4a6266a1",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:24cc533f1b81b8c79bd99bcfd8c7f94d07503591f46d53af8467002a4a6266a1",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
    "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
    "sha256:6471c927fdb07b22109ed5e64c52608041c4c52cbd4236f31c0ffe91b4b46af2",
    "sha256:1c5f99013ab26f1c86cad8fe1044d92cea5d7566930b26613cf31445f3ae3a87"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:7eeb65458c924f183658b54548463450ddc828a4d7f3fd9746b263c88a6cbbba",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:7eeb65458c924f183658b54548463450ddc828a4d7f3fd9746b263c88a6cbbba",
   "tagSymlink": "439144e4",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:7c89981748d38fafa31c8a8d624381db9c14c07160de7bc13588a0b0e3673b33",
    "sha256:1d988be397cae4aad67a43534a2875edbee24135ba549549156fb8aa883f22a6",
    "sha256:54f6bca97f44b76c065bbaed5915a97693ce1ea1a3f3a1cf65c610ff81622f3c"
   ]
  },
  {
   "name": "sha256:7c89981748d38fafa31c8a8d624381db9c14c07160de7bc13588a0b0e3673b33",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:7c89981748d38fafa31c8a8d624381db9c14c07160de7bc13588a0b0e3673b33",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3de00bb8554b2c35c89412d5336f1fa469afc7b0160045dd08758d92c8a6b064",
    "sha256:c530010fb61c513e7f06fa29484418fabf62924fc80cc8183ab671a3ce461a8e",
    "sha256:6c155a0c493b106911b1fa3b975be2fc7e07ef3e8619b7d5b0d169488fce15d3",
    "sha256:cf0025a8a0f8316b443fd9c78be81e4c9d5fc51e2a559ec1544587aa3875f7ae",
    "sha256:5ec9f635fe39c0a7b767de084526721f7d6faf34558b22cf84769a214583f7dc",
    "sha256:d667946774b493e1779d7cc0afe77710662feb47a30ee96916d784924e193634"
   ]
  },
  {
   "name": "sha256:1d988be397cae4aad67a43534a2875edbee24135ba549549156fb8aa883f22a6",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:1d988be397cae4aad67a43534a2875edbee24135ba549549156fb8aa883f22a6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:2cbc2866f0e2741aa3c72c6a699db0f8b25a5a5fea7d49ee2aa4f9a97ec6ee4c",
    "sha256:17e3a5f768e10e019b5bf765f63f8f9243bdfc7856b6c5b92b2b93430a7a91e7",
    "sha256:94d83113c109588bc1fa214757a0039e7f30de42ed7198534778862ea0808ec6",
    "sha256:fb87d8b58779f27b458c4f0390c06913531b4e5f598e6775c2d9514612dfb912",
    "sha256:0153ef0ea24a20d0090be1e0f0aa68ac406f03bacc42ebd981746c362261d73b",
    "sha256:6c79ff80bbaeeb1bfc7dcd86d5b969d3db865e6136989e2283ce3e35beb31c6b"
   ]
  },
  {
   "name": "sha256:54f6bca97f44b76c065bbaed5915a97693ce1ea1a3f3a1cf65c610ff81622f3c",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:54f6bca97f44b76c065bbaed5915a97693ce1ea1a3f3a1cf65c610ff81622f3c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:bdee7855ef43f1c1d40221634c315c1998e5ee6f976d77dec4834f669bee371d",
    "sha256:df8985aa78d66ad0ca1e65cdf78c0a770212de626074c34770d25b8dcfc5e4bf",
    "sha256:113d1f68e376ad7a3bf129e8f089da75d1fd7a2938edec3d1dc6811a5e00aa10",
    "sha256:692a101ec5121707373957b27689e8f0b4564e10e9aee9985eb8f1824c36e892",
    "sha256:3691e020fd546c95f3a65ebad8b64b2fa390c31703b42e042e968119736806ca",
    "sha256:974003bd281ec2048dfcebd5bbcb7477e6b69dbb3083bffd3a5c4dee0284130a"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:182d966cb488b188075d2ffd3f6451eec179429ac4bff55e2e26245049953a82",
   "path": "odf4/odf-operator-bundle",
   "id": "sha256:182d966cb488b188075d2ffd3f6451eec179429ac4bff55e2e26245049953a82",
   "tagSymlink": "fb32bc37",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:8ac332a1ae38ccacc975605d72dc9123d031be9b8d17b28c38ff44af5003225c",
    "sha256:411fadeec6a91bc321d1a78f2234c1c99a57d2ca6c83e3524e4a059678ddc9c4"
   ]
  },
  {
   "name": "sha256:eee49735c571235e3ae31a744ca42b6be77ac6bd32e215a5fd9dbadaba1655d6",
   "path": "openshift4/ose-local-storage-diskmaker",
   "id": "sha256:eee49735c571235e3ae31a744ca42b6be77ac6bd32e215a5fd9dbadaba1655d6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
    "sha256:b56af1360c83e0a0479bf161b3ec392c8c513f8e8104700c8ed696fe4b261c8d",
    "sha256:e3e58850242aeb7a5ea292ad8cc81e9b93348c377166e02c6689f022d8400be4",
    "sha256:3ddd737cfd1c65622914f24fab3339e8fc27f7c8399820a551df2f05e6215613"
   ]
  },
  {
   "name": "sha256:95990a16ba9b1d2796f82c5939c7d19446bf87e5b21c42a2726eaa628c9b77ea",
   "path": "openshift4/ose-local-storage-diskmaker",
   "id": "sha256:95990a16ba9b1d2796f82c5939c7d19446bf87e5b21c42a2726eaa628c9b77ea",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
    "sha256:74f1fb7a06eab765809ca437e035b054dcfb1e6ecb3158ecc8a9076b6f26210f",
    "sha256:4d958a5050d6726390d3848aee85bdbc448933f51e227a98e5d9775a0f32c731",
    "sha256:a49aaacf7765e8104bbe9a0bcefe4816f401a96ee6be8284106714bf56bed7e0"
   ]
  },
  {
   "name": "sha256:9ad61e2534e0818536a0ef01cb465c4de13e6c7c4ca255177d8c992eaf7368e7",
   "path": "openshift4/ose-local-storage-diskmaker",
   "id": "sha256:9ad61e2534e0818536a0ef01cb465c4de13e6c7c4ca255177d8c992eaf7368e7",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
    "sha256:9510f581bc6968bd3717fd248986be74458e606ee275a794d769df8d1e544640",
    "sha256:a510116adb4843247d09da971967c7c2c7433f28a00b20adb28500f7e731a755",
    "sha256:c726bf573935bf1ee43604c6f8e0565ab13522ed6b9a7d2bdde7f551b1f7d26b"
   ]
  },
  {
   "name": "sha256:6c4804ad646cf7ab338a5bf689819ab811f59b909479a73a7bf0dc4ca64dda10",
   "path": "openshift4/ose-local-storage-diskmaker",
   "id": "sha256:6c4804ad646cf7ab338a5bf689819ab811f59b909479a73a7bf0dc4ca64dda10",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
    "sha256:39504606388e1d44d94d8a1b2d37e37c80a5453590aaa0ec5b1c8b510a77750f",
    "sha256:71a31f5f3ddd970d2cb95f9a66c68767f1f6a019bf2eafe9be7ed19844282d89",
    "sha256:eea541bd457e0ae997a5de9258edef09013726fbbf1415879005ceb7c318823a"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-local-storage-diskmaker@sha256:59c007844374c698e948abbfebc47e42b6a40ed3d6065d78c28e677587f9a780",
   "path": "openshift4/ose-local-storage-diskmaker",
   "id": "sha256:59c007844374c698e948abbfebc47e42b6a40ed3d6065d78c28e677587f9a780",
   "tagSymlink": "3181674b",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:eee49735c571235e3ae31a744ca42b6be77ac6bd32e215a5fd9dbadaba1655d6",
    "sha256:95990a16ba9b1d2796f82c5939c7d19446bf87e5b21c42a2726eaa628c9b77ea",
    "sha256:9ad61e2534e0818536a0ef01cb465c4de13e6c7c4ca255177d8c992eaf7368e7",
    "sha256:6c4804ad646cf7ab338a5bf689819ab811f59b909479a73a7bf0dc4ca64dda10"
   ]
  },
  {
   "name": "sha256:cb9edb7b70d7c4b51fd76d60375bdf825ced57b24d2721638038c33ea8fdfd0c",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:cb9edb7b70d7c4b51fd76d60375bdf825ced57b24d2721638038c33ea8fdfd0c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:0c1fd83997e17b079085107d40f89cea2211f9ec3db88d5241019a85d06db5a7",
    "sha256:e76fbc91af5d560232191ef55c8366dcc52e0f8d4ddf97ba6140329787db6c39",
    "sha256:1d616dd988a30955cb276ab13571ee9f6f31dcf02c9c2ee78e9a618a7220dc23",
    "sha256:b690536f7d0f3e95e509e955b4ab865f7b6c2381fc7e71a54f32bab62b89a5a2"
   ]
  },
  {
   "name": "sha256:af8388cb68cf4c46dd2c6bb33f9e173a72959749366374bb173dd198b1143501",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:af8388cb68cf4c46dd2c6bb33f9e173a72959749366374bb173dd198b1143501",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:d2be686e74da7c701311c471acf80b269afb9a3165314de5aa2b9a6df6562fd7",
    "sha256:98a3f59d1db45f44899db07a0f1cbc3525c9e1cfa91805892ecabbe31ee7a769",
    "sha256:2f016b03975bb2d59e9546c0f4db6ce0339e01abc1905dfbcd5459a48757efd4",
    "sha256:55d2014c6889fb7e8c970c9a64cc8ddc940c6ae2326f21c8edb2491533cd034a"
   ]
  },
  {
   "name": "sha256:614cb31651348ed5b28c832d730f4e8b1877d02008ccaa89e2830acda79bc811",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:614cb31651348ed5b28c832d730f4e8b1877d02008ccaa89e2830acda79bc811",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:da6cf90000f1e8c68029513a3674919c4c460ed472ba88ccbaa046c74ddcc951",
    "sha256:92c3cd1997868b9ccce823c559765bc77f5bbc8ad061d6a81d382c568a21fb58",
    "sha256:e5bd8740d3a1a00a609f66dfbfabc797e1b28fc9bf762726bf0e5157804db430",
    "sha256:4e37b95877c4e3d4133766b91500219a2e921c20e3c784b5fb73958e3c15b3f1"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:ab6d793450e1ed2129e813525e888cc2dc0e4b96cfcac38cce1e99d36b94ffe8",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:ab6d793450e1ed2129e813525e888cc2dc0e4b96cfcac38cce1e99d36b94ffe8",
   "tagSymlink": "c1d122bd",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:cb9edb7b70d7c4b51fd76d60375bdf825ced57b24d2721638038c33ea8fdfd0c",
    "sha256:af8388cb68cf4c46dd2c6bb33f9e173a72959749366374bb173dd198b1143501",
    "sha256:614cb31651348ed5b28c832d730f4e8b1877d02008ccaa89e2830acda79bc811"
   ]
  },
  {
   "name": "sha256:4677fa33897f97cc48709dbc217b580edfdc0e7d3d60399fad2e32b2dc78452b",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:4677fa33897f97cc48709dbc217b580edfdc0e7d3d60399fad2e32b2dc78452b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:1b890c73c3cf60b04334fded9e3edc647d64dd39ffd078317e2bd69552a2fd1d",
    "sha256:de63ba066b7c0c23e2434efebcda7800d50d60f33803af9c500f75a69fb76ffa",
    "sha256:fd44f54cba95782d78c23422ec85c1569d551c44c887547be38cf0ebe2777729",
    "sha256:b6321c2f412b967ff97b0d4ff77bf9bb8007e3a4a013f64f48419abe9856dd27"
   ]
  },
  {
   "name": "sha256:88fc354349a6b8025b129114ed504c20eb82dbbac942d7150fca49adea7e1eb3",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:88fc354349a6b8025b129114ed504c20eb82dbbac942d7150fca49adea7e1eb3",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:9f78280d50082c329e73123d73b3debc7f5eec007d8a0c7b1d388ff69b9652fc",
    "sha256:a1a64b9c0d1a2a468c65bf81fb26d51416a3e19d95d08df39e5d7d012a25b685",
    "sha256:b8eed6d6be1ba11705a327cb865a21d9da22d92b757e4b368d6b0ece72bf671f",
    "sha256:c78156a192b3ac20cd70c704cf995186d09598d93b295dc43e64546e52c74ddb"
   ]
  },
  {
   "name": "sha256:312cf09ee5bb8cf6b92f083e48f97ed3bfa7b27af2646e7a7e2e2594f1dc9dff",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:312cf09ee5bb8cf6b92f083e48f97ed3bfa7b27af2646e7a7e2e2594f1dc9dff",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4f639942cb5a04cfde9e90ad4590927d87ec970f46186ebe46182c2f0657584d",
    "sha256:261c17695cc21090e4719a05e282f024f0ab9a36997b3e3550ee7a97dee98668",
    "sha256:1b9bab37b81bf366fb024ce58af8e9548fb09b80f8c1212b2a02524b942181f3",
    "sha256:11233cc031a58f7b31f06644e1b138a8cdf720e69c4794421d89d55beb7eeee2"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:0d8f33ac4bdc4bb095bcfc4e32ddf44b110a48cc44d1b1bda8ca5dd4cccb72a4",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:0d8f33ac4bdc4bb095bcfc4e32ddf44b110a48cc44d1b1bda8ca5dd4cccb72a4",
   "tagSymlink": "4495708c",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:4677fa33897f97cc48709dbc217b580edfdc0e7d3d60399fad2e32b2dc78452b",
    "sha256:88fc354349a6b8025b129114ed504c20eb82dbbac942d7150fca49adea7e1eb3",
    "sha256:312cf09ee5bb8cf6b92f083e48f97ed3bfa7b27af2646e7a7e2e2594f1dc9dff"
   ]
  },
  {
   "name": "sha256:6722074f8f40998748881b79530c795dcb2f3d2fdffa4dc48dbe44b8c2d04637",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:6722074f8f40998748881b79530c795dcb2f3d2fdffa4dc48dbe44b8c2d04637",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
    "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
    "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
    "sha256:7187c86e9afc5be63df3301b3a4bc90d9868e69417525cae18f8cb631ba5b56f",
    "sha256:3facd0ff1c9edeccbb22cdf26453e7477f2f9ed1a47edbb4dca83c61720cb679"
   ]
  },
  {
   "name": "sha256:d312dba57576825eb79e6a1e04454cce18b73a0e4d19192c468aca6bed69b03f",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:d312dba57576825eb79e6a1e04454cce18b73a0e4d19192c468aca6bed69b03f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
    "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
    "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
    "sha256:152b17e6f69a9ad6d042ea6ced2f7ea4d7238d7faab1de4563777584ac02bfc0",
    "sha256:ee39cb5b3d00940c11a7d2c3545a0fe4a903702cbae6eff9e193558c778e6252"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:b574d632936d350ce69f554a5da65a43227ab2105ec0cb890eadf2ec5f0c5e33",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:b574d632936d350ce69f554a5da65a43227ab2105ec0cb890eadf2ec5f0c5e33",
   "tagSymlink": "689f44a7",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:b11c5f1586fec9dc4793dd5b96cd84791460e9879e862b7b513a7fa3a55384f5",
    "sha256:6722074f8f40998748881b79530c795dcb2f3d2fdffa4dc48dbe44b8c2d04637",
    "sha256:d312dba57576825eb79e6a1e04454cce18b73a0e4d19192c468aca6bed69b03f"
   ]
  },
  {
   "name": "sha256:b11c5f1586fec9dc4793dd5b96cd84791460e9879e862b7b513a7fa3a55384f5",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:b11c5f1586fec9dc4793dd5b96cd84791460e9879e862b7b513a7fa3a55384f5",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
    "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
    "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
    "sha256:0c5d2340c248d2ff8d1dfdb1bbe8070bc2e83cfd44717293d95e1ae0402e9f26",
    "sha256:75175c9a975d0e3f82b54724b17b52cb64fed3e5cd8aa1140f07fa8562165a03"
   ]
  },
  {
   "name": "sha256:e6162ae89bf73e29c304080e868d47f13c46e389c6f2f6bde856ebeda20306f5",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:e6162ae89bf73e29c304080e868d47f13c46e389c6f2f6bde856ebeda20306f5",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:510abfcdf6bce7517c9dbde8fd24c03d8f36fe1503f65a712f824401f857aac7",
    "sha256:4a3604715398d774a2abb75d31b035aa4099557f7016e27550cefc9759368cda",
    "sha256:b1858bd7e64bc3c6f055aed1cc736d5856e1b4e682fb8c9f0610deee16e8b86c",
    "sha256:ab782b054d3b24d4f78c772569a5d289222a021f2dbd806224e1cf33e648501b"
   ]
  },
  {
   "name": "sha256:4a4bd7a6b537d75aaa982c308eedc805809c2576f5d75498a432991c7e199534",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:4a4bd7a6b537d75aaa982c308eedc805809c2576f5d75498a432991c7e199534",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f2cdfe33b637eca2019910dbfd9c00211fe1aeda61fe42b23f08bb74a91e72f5",
    "sha256:6d9e8294c3485a103e1bccd5ab429804c39e30fa9217e9b8e15154afe93e3167",
    "sha256:22ea396101b498c9d91573e641b65ee4ea92580ae07f390088edb696877f4363",
    "sha256:95f24e07e5f81b739ca12a4af0876c87a744e9f4d9e140f38011caadd381ac22"
   ]
  },
  {
   "name": "sha256:ae593d312597211d35a2d89cefdcf879eb1db1eac9bfdc76c756be78b111b5e7",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:ae593d312597211d35a2d89cefdcf879eb1db1eac9bfdc76c756be78b111b5e7",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92491c8a90cf467336f6e7d283809c4de69e0141bdcf17c023b1edf310c8f678",
    "sha256:be2d37fed3de60e335e761ccc650ef174a17f8be5660b42bc5cc227b557aa13c",
    "sha256:a3f25dd179d93de69756b41e8a03e52cf32321fccf2f4e2e420f1ecc210f4ab1",
    "sha256:8af9676f44dada86112a0ce9f26119e1f14fad5ff0da75b62a2dcedf64820281"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:a94616d282a27ddae1c69ae73ffd1917e141ca3b3d6d0dcf1ec5268293f211fc",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:a94616d282a27ddae1c69ae73ffd1917e141ca3b3d6d0dcf1ec5268293f211fc",
   "tagSymlink": "e82dc2f1",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:e6162ae89bf73e29c304080e868d47f13c46e389c6f2f6bde856ebeda20306f5",
    "sha256:4a4bd7a6b537d75aaa982c308eedc805809c2576f5d75498a432991c7e199534",
    "sha256:ae593d312597211d35a2d89cefdcf879eb1db1eac9bfdc76c756be78b111b5e7"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-provisioner@sha256:60883fd78b799de9c8320c46263bd67fa4ed46ae8ce84fa3440fdd66a4c51355",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:60883fd78b799de9c8320c46263bd67fa4ed46ae8ce84fa3440fdd66a4c51355",
   "tagSymlink": "527e62aa",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:233832721f083c9d6b255c898da716579ca772b93589d40834672282303bbe63",
    "sha256:03ae0170819be645491dffc6db07797caba0aeefefcd9472af3bfacb07239319",
    "sha256:ee4a94686f3c3816d7152e0bcd67ae13e901c78a248d7499b5052e1f846776c6",
    "sha256:3ed79fb8475fa1ce34e9c1a974335663359e4d87e2050b7cf19d13bfdc392307"
   ]
  },
  {
   "name": "sha256:233832721f083c9d6b255c898da716579ca772b93589d40834672282303bbe63",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:233832721f083c9d6b255c898da716579ca772b93589d40834672282303bbe63",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
    "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
    "sha256:f503075cdb5ef12e2a81a9b7ea3d5e710323968ff435d8a71fcacbeddff337ad",
    "sha256:cae30fe4f08a365ff27c9e2ea089612ec88e4b422e1d8a8da568b63f958e7ce8"
   ]
  },
  {
   "name": "sha256:03ae0170819be645491dffc6db07797caba0aeefefcd9472af3bfacb07239319",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:03ae0170819be645491dffc6db07797caba0aeefefcd9472af3bfacb07239319",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
    "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
    "sha256:6eb3dc177c6b3d29303cdc3b6a0b17da4245027d62c46984a7e68b031cb35492",
    "sha256:90312accc86ecd9d94a15ac15c4e74a2c70cfc7e0d0be876634afc397bbc8e6e"
   ]
  },
  {
   "name": "sha256:ee4a94686f3c3816d7152e0bcd67ae13e901c78a248d7499b5052e1f846776c6",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:ee4a94686f3c3816d7152e0bcd67ae13e901c78a248d7499b5052e1f846776c6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
    "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
    "sha256:10c7f6255d16b74cc8b78e5dad12bfb39d20aabe7d21c572c4c2d3d8713a5b98",
    "sha256:283a23416e7e9c7fa303835091d20642c0dd2c2acb94326df39f8328988e9d6c"
   ]
  },
  {
   "name": "sha256:3ed79fb8475fa1ce34e9c1a974335663359e4d87e2050b7cf19d13bfdc392307",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:3ed79fb8475fa1ce34e9c1a974335663359e4d87e2050b7cf19d13bfdc392307",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
    "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
    "sha256:f36ce79926fa85f828a371348baa236d2826b7bf8d6cc741e88de3cda2b2aeae",
    "sha256:60ebe3bb2250f504aef5f6bc341aa131d0bb6e572a21bbed468440663b27385e"
   ]
  },
  {
   "name": "sha256:83fb4276de115ce25417a6900b507d78587f28c344dafa6d1f6bdd0e25d7b680",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:83fb4276de115ce25417a6900b507d78587f28c344dafa6d1f6bdd0e25d7b680",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
    "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
    "sha256:dcc3506d7f3a1f73044b29119978401137448e752156c4dc17653094cfb59489",
    "sha256:b19cbbd539107c95689d48d730677c23b6e007f247e3b7a4d646578d444662b3"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:20954f1fd9c2bac5cabaedbeec25d60b31546ffc05f3e4c38ffcf45e2ed41be9",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:20954f1fd9c2bac5cabaedbeec25d60b31546ffc05f3e4c38ffcf45e2ed41be9",
   "tagSymlink": "29f38640",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:08e8b4004edaeeb125ced09ab2c4cd6d690afaf3a86309c91a994dec8e3ccbf3",
    "sha256:6fdfc98514441b8bdd1b6b0679fe36bbc10b8b0c6c4ef24826dff013f90ccfbe",
    "sha256:96ecd8fb5af468a9bf8720bf98f2117e613afd9f247c9fabac6c76345c8ae121",
    "sha256:83fb4276de115ce25417a6900b507d78587f28c344dafa6d1f6bdd0e25d7b680"
   ]
  },
  {
   "name": "sha256:08e8b4004edaeeb125ced09ab2c4cd6d690afaf3a86309c91a994dec8e3ccbf3",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:08e8b4004edaeeb125ced09ab2c4cd6d690afaf3a86309c91a994dec8e3ccbf3",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
    "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
    "sha256:78eb701467af757f6416a167e304b48e4f79584a06d77aabc31e3402e701432e",
    "sha256:55e294662f2c60c72271f4261f19b1be9c52515ffc76ba79f93bb44022fec181"
   ]
  },
  {
   "name": "sha256:6fdfc98514441b8bdd1b6b0679fe36bbc10b8b0c6c4ef24826dff013f90ccfbe",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:6fdfc98514441b8bdd1b6b0679fe36bbc10b8b0c6c4ef24826dff013f90ccfbe",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
    "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
    "sha256:131b099b7937501890451e98e8358ca318a2d822b261e108300c25b83ae90094",
    "sha256:f6ab5ab2d32630d57a78c45d0c2db6349610e3445da2ce6e19040e34a5542148"
   ]
  },
  {
   "name": "sha256:96ecd8fb5af468a9bf8720bf98f2117e613afd9f247c9fabac6c76345c8ae121",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:96ecd8fb5af468a9bf8720bf98f2117e613afd9f247c9fabac6c76345c8ae121",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
    "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
    "sha256:53a9beae3fcb5a0217f7f73d71fde7db4f4dc8e8008835d511179217573dd65b",
    "sha256:bd42e4d1f7ec9d4f48b00e4a1548a0140c7832416307703adb0e0ff577877664"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:ad9e7a8bae4e1d93ea1ceb9a8b57564e29639fbdc3bdd166a786e77eb120459a",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:ad9e7a8bae4e1d93ea1ceb9a8b57564e29639fbdc3bdd166a786e77eb120459a",
   "tagSymlink": "5f62ae23",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:2467f6af0910a0a13e3cc27b61047d096516cf8121a2ccb5bb53bd3b15161d67",
    "sha256:c83d71f10290b58c009b6bc69ea30c8f30a8783f56196bd7781429746fc33643",
    "sha256:409d952006035e35f91c49beaea03c0ef94633e7d215c23b1d912b0ca4ad7bfc"
   ]
  },
  {
   "name": "sha256:2467f6af0910a0a13e3cc27b61047d096516cf8121a2ccb5bb53bd3b15161d67",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:2467f6af0910a0a13e3cc27b61047d096516cf8121a2ccb5bb53bd3b15161d67",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d3b9a4a690bf1791b874c3495c6a8e2c039150b5882374cd9c42dd4bba68ba31",
    "sha256:a049ed70eeb87542c711449e14b6a7ccdde9ca2219d749fa0872aa755f2a89cb",
    "sha256:1943aa8fcf8db9481219eb792fcae32cdbf7444ce0748dcb8f8dfbbe90846fb1",
    "sha256:be068a32451285a2b1c714d0eac5a1e4e2f9ff32eba78ff4dcb3c40eeaba0970"
   ]
  },
  {
   "name": "sha256:c83d71f10290b58c009b6bc69ea30c8f30a8783f56196bd7781429746fc33643",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:c83d71f10290b58c009b6bc69ea30c8f30a8783f56196bd7781429746fc33643",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:02863a09124c1837ee0672a011fb7e2d5c95ae16af6b569f65d2e0f763127ddc",
    "sha256:97aead8e17dadf7e07e5153ee6d5a68d28e46847e01db6d9325742076043fd20",
    "sha256:e927bb5b2f36566f4751ba812a4481ce0a36bd9fc9cef2d0aebdf60ad44e6c81",
    "sha256:bdd943fe1d1f0ea3df31bf206c5f92b849ed7e8e2aedd887b20b82a9949da0d6"
   ]
  },
  {
   "name": "sha256:409d952006035e35f91c49beaea03c0ef94633e7d215c23b1d912b0ca4ad7bfc",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:409d952006035e35f91c49beaea03c0ef94633e7d215c23b1d912b0ca4ad7bfc",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:220d447748c8866cbfeac8fb3534dd8d49cc8b99cc625041414c17d0f80e02ca",
    "sha256:8909629d32e7d0fef085a5fcee0e0f318367006d81be0d5da8e0a209ee230793",
    "sha256:64250247c1ee7bac23e5e7b087c1ec11f4e2f95d40525d3b6aea9c5ae53523b1",
    "sha256:08ae180fcbf91704b9f4b7f85aaa633788e554e39eb6b420adda7fcaf3a052b8"
   ]
  },
  {
   "name": "sha256:f5a05b98f9ba8a9ece3e09d684fd0d6734137d578dd0d0e11a23010ffa733993",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:f5a05b98f9ba8a9ece3e09d684fd0d6734137d578dd0d0e11a23010ffa733993",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:7d2062c526eb8caa07941ad221bf417d471b3697cf036f9dfeaa072fc13cb658",
    "sha256:21a5bb8bbb953bedf28c944938f8d3561ced4148f066407e90c0ad823467f980"
   ]
  },
  {
   "name": "sha256:67961c4ff4f632eae6819647c525f0beec2f76622a2e9c1613b3454a674d1fd0",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:67961c4ff4f632eae6819647c525f0beec2f76622a2e9c1613b3454a674d1fd0",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:0b23df69181077267a19f9404c0ab6f5d79a79b8f615341370266e248e94a854",
    "sha256:27dccca561abce1ec836cc4ea37e03f3247fbc696c684b7cdc2cc71cdf64d20a"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-rhel8-operator@sha256:9ca68ff20b805c4ed458c8f6dcab6833bcd8c656278ab3e69aa945960a699fe0",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:9ca68ff20b805c4ed458c8f6dcab6833bcd8c656278ab3e69aa945960a699fe0",
   "tagSymlink": "3d44e037",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:1ed80c2b8eacf8376ef274dff1e8248054b6c7fa83d8fbb05b7b6b6aa64d6c3c",
    "sha256:f5a05b98f9ba8a9ece3e09d684fd0d6734137d578dd0d0e11a23010ffa733993",
    "sha256:67961c4ff4f632eae6819647c525f0beec2f76622a2e9c1613b3454a674d1fd0"
   ]
  },
  {
   "name": "sha256:1ed80c2b8eacf8376ef274dff1e8248054b6c7fa83d8fbb05b7b6b6aa64d6c3c",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:1ed80c2b8eacf8376ef274dff1e8248054b6c7fa83d8fbb05b7b6b6aa64d6c3c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:6b7813843375be5e0214ec8237b1fc201392465e4a7362a3261c8f3db4745013",
    "sha256:e9c88c5ea38d53656a57729a0df240cf6c94620483ef89b612a0b16fff8dd0c3"
   ]
  },
  {
   "name": "sha256:845d24c10e90d6700d3bb93516d59db70417964783a765136c07c01f1391e87d",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:845d24c10e90d6700d3bb93516d59db70417964783a765136c07c01f1391e87d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
    "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
    "sha256:a805e0e82d1e807c9784567660413c0744fbb2fccf94264885afb86cede3d463",
    "sha256:7818fdfc08bdfd6b986a69692cb4bd6d6beb5ddc8b93107482c26f6e81abb989"
   ]
  },
  {
   "name": "sha256:37a342edfbe3b5375fa94c806ee293c191975d553ae68f716f0c11d6fd31951f",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:37a342edfbe3b5375fa94c806ee293c191975d553ae68f716f0c11d6fd31951f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
    "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
    "sha256:ea4cea25854d327c37416691329f9193e845a80c71f557f4c17d57dd864eb4b2",
    "sha256:129c703953c3fd5f18493de9ce1bec5ef87195c97f5cd2cb19b1293827e24d41"
   ]
  },
  {
   "name": "sha256:9c979593429d4e0096a14459828002edad09fd71dbaf274c5d94cbaba394e8e0",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:9c979593429d4e0096a14459828002edad09fd71dbaf274c5d94cbaba394e8e0",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
    "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
    "sha256:18a1e127cb9b358cb10f3b093405c25ddb04e36ef4ded2c935b38cc195dae452",
    "sha256:f850f5027288df34903c6380d821c189a7812811213987df1c403463d81819a1"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-attacher@sha256:9b1c595785ebf3dacef11bcb95829a785456d7c0dad6b595a9c8284d559b079b",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:9b1c595785ebf3dacef11bcb95829a785456d7c0dad6b595a9c8284d559b079b",
   "tagSymlink": "88d4dbfa",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:1dac1bef2b7911432d8b6a5ed8141fe009080a414f3b5f1740892900bb9a5744",
    "sha256:845d24c10e90d6700d3bb93516d59db70417964783a765136c07c01f1391e87d",
    "sha256:37a342edfbe3b5375fa94c806ee293c191975d553ae68f716f0c11d6fd31951f",
    "sha256:9c979593429d4e0096a14459828002edad09fd71dbaf274c5d94cbaba394e8e0"
   ]
  },
  {
   "name": "sha256:1dac1bef2b7911432d8b6a5ed8141fe009080a414f3b5f1740892900bb9a5744",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:1dac1bef2b7911432d8b6a5ed8141fe009080a414f3b5f1740892900bb9a5744",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
    "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
    "sha256:3d282acae4c22e0475521cf2a7cfbc607794980818865fde289619005345de98",
    "sha256:986a969f4ac6665ba7baab2cbf3a69b0b9476c0dc94944a6535e31dbe15b71af"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:db35b81f6655a08014e843d79fa09c8c40fe18f1eadc285cd7db5866546d87d0",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:db35b81f6655a08014e843d79fa09c8c40fe18f1eadc285cd7db5866546d87d0",
   "tagSymlink": "38ec220d",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:cd7555805a368f8cc58f813778f6afb4ef440cd57971c182a76292cc9d2dc7d4",
    "sha256:3c2fd709e8b53703af8d43edbec7329a606c4f8b893a0ee9a3f698ecd5ec73e0",
    "sha256:29976510af6505f66d901760ab8fea4e7728eac6d29a057d2087f0a1b87fe1f4"
   ]
  },
  {
   "name": "sha256:cd7555805a368f8cc58f813778f6afb4ef440cd57971c182a76292cc9d2dc7d4",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:cd7555805a368f8cc58f813778f6afb4ef440cd57971c182a76292cc9d2dc7d4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
    "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
    "sha256:9054b3c65ddde3513a950445cae9a66a1466d3f2542689a8fba891b23c760da2",
    "sha256:0308efb0948b3167eb5f4f73269b505a95366352812a853fb21aed32b611c6fb"
   ]
  },
  {
   "name": "sha256:3c2fd709e8b53703af8d43edbec7329a606c4f8b893a0ee9a3f698ecd5ec73e0",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:3c2fd709e8b53703af8d43edbec7329a606c4f8b893a0ee9a3f698ecd5ec73e0",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
    "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
    "sha256:aa7181879654543f7cd4e1ff5930bd4a5e3aabb09d437c356c5813a33bae8e46",
    "sha256:cb0329bcccd088113b5fae6bb7649b84d9443a0439ef071e7ac369d79f222606"
   ]
  },
  {
   "name": "sha256:29976510af6505f66d901760ab8fea4e7728eac6d29a057d2087f0a1b87fe1f4",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:29976510af6505f66d901760ab8fea4e7728eac6d29a057d2087f0a1b87fe1f4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
    "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
    "sha256:79652dc1eab77c217465dcec66fcedd370a09287459a71535d92c2f77b8b6117",
    "sha256:55cce6c465d4a15f610e0c5ce81c6a39a5bcf111e45c0a9177074be1b0ae4d17"
   ]
  },
  {
   "name": "sha256:3dcf6eeb8d06b21b96c1f59813981eaf0813aeb22509029988d7d958fbf0c914",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:3dcf6eeb8d06b21b96c1f59813981eaf0813aeb22509029988d7d958fbf0c914",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:2a1a0cded0f72cc0f5b922e254e64859b8a263b72d5ae9af9a196aa3e73e59c0",
    "sha256:7e706e442779316087776ca98954334f0bbc4aac78dc6c1e5b50d95533186d67"
   ]
  },
  {
   "name": "sha256:d80de06fa4fba609711ed133e2b0eb7c93db177bf2c0b62b90204de98348054c",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:d80de06fa4fba609711ed133e2b0eb7c93db177bf2c0b62b90204de98348054c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:b7be3992d334655ab8b83676742281df4b8ae9df1359af4545ba630b1643082c",
    "sha256:f371c9f92a724a779fc361a367b1ea927a49a17fd8cdfcbdef5bb00f1e3d6574"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:9dc3002750d465847390cc481f1ca8d9f9e1a7d7f1102583a1f9182565cc3695",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:9dc3002750d465847390cc481f1ca8d9f9e1a7d7f1102583a1f9182565cc3695",
   "tagSymlink": "9066065e",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:8cdc93f6f47459bcc8054ad5e84bec91cb9bd7d6edd3b47f0dd5e63b6a654659",
    "sha256:3dcf6eeb8d06b21b96c1f59813981eaf0813aeb22509029988d7d958fbf0c914",
    "sha256:d80de06fa4fba609711ed133e2b0eb7c93db177bf2c0b62b90204de98348054c"
   ]
  },
  {
   "name": "sha256:8cdc93f6f47459bcc8054ad5e84bec91cb9bd7d6edd3b47f0dd5e63b6a654659",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:8cdc93f6f47459bcc8054ad5e84bec91cb9bd7d6edd3b47f0dd5e63b6a654659",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:11a967fd7b2ffe59688fa6d7b19a9c359c55884de52ce578c0c6a776f3be2cf4",
    "sha256:d1ccdf0bdf3a316c00306b4f3c8dd220448cb1d13fbafd7810c4c780428bfd21"
   ]
  },
  {
   "name": "sha256:d38d99215bf992169e549187ebc6d94c5a9d00dc37bf0ff00eca7e2b57a0cb10",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:d38d99215bf992169e549187ebc6d94c5a9d00dc37bf0ff00eca7e2b57a0cb10",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
    "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
    "sha256:39ae544373a117dece24092229e6e9ceac1f297678b342b820aaad20ac96ac81",
    "sha256:da09835fc1d9019a109339b8a6ee02919102e89ff299990a072e6ee20c7fa245"
   ]
  },
  {
   "name": "sha256:38b3d2ac7ab4e2fd4027a98a8e8f43d6bf3b7384e7968710e2c4087908cee097",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:38b3d2ac7ab4e2fd4027a98a8e8f43d6bf3b7384e7968710e2c4087908cee097",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
    "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
    "sha256:f6d20cda635a2a44e563c0107833b02275ec4a98673047845d73edb1804aa760",
    "sha256:0405c15437c5e6f6122d7e007a60f767a1ce5cddb7bbad4e4ea77e6317f2d2d7"
   ]
  },
  {
   "name": "sha256:1c88efb5bdac5f7b9a560b65d6ef9ced267541d393067011098782039d9293d0",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:1c88efb5bdac5f7b9a560b65d6ef9ced267541d393067011098782039d9293d0",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
    "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
    "sha256:a01a871b89993e1c4791d49cbad82beb3dd11b5e3ba87d9648b07907f031e0bd",
    "sha256:c5a46869e999dc6d5b935f166c5a24bcdb47c1368840823100529136b4bf8749"
   ]
  },
  {
   "name": "sha256:d3651d16b145c8cdf05e9715e18fef4d3c59c156ca8d644189e8652d5278aee4",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:d3651d16b145c8cdf05e9715e18fef4d3c59c156ca8d644189e8652d5278aee4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
    "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
    "sha256:e4566bf69a69a894277ec951e16f879a1331d4c70982c8d46cdc6beb735589b4",
    "sha256:cd5383e1c8bfe20f8e0b836fb1f3b61b95ea63315ee26261ba4774aa0c2a951e"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-snapshotter@sha256:997ff97cbdac7786bc5c8b9c2f0efa667ff0fc4bd02c0345225d79babcb2a912",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:997ff97cbdac7786bc5c8b9c2f0efa667ff0fc4bd02c0345225d79babcb2a912",
   "tagSymlink": "845fe4b6",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:d38d99215bf992169e549187ebc6d94c5a9d00dc37bf0ff00eca7e2b57a0cb10",
    "sha256:38b3d2ac7ab4e2fd4027a98a8e8f43d6bf3b7384e7968710e2c4087908cee097",
    "sha256:1c88efb5bdac5f7b9a560b65d6ef9ced267541d393067011098782039d9293d0",
    "sha256:d3651d16b145c8cdf05e9715e18fef4d3c59c156ca8d644189e8652d5278aee4"
   ]
  },
  {
   "name": "sha256:22eaf1d54ca67731874c5b3fa1acdb3af194e2ee1d44ce96be15730e73db715d",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:22eaf1d54ca67731874c5b3fa1acdb3af194e2ee1d44ce96be15730e73db715d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
    "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
    "sha256:aec584187c1df4b4776087c093a1c8727fe4f78229f652455e03130b0ba52a55",
    "sha256:c2943e5d09f55a7bd6b6ed161c348c8ad57331819a1e0b8713690e3a0403762a"
   ]
  },
  {
   "name": "sha256:4bf2e662e2e60904de44f770f9b4fafb0ca1172eebffb590c52a355be59ec3f8",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:4bf2e662e2e60904de44f770f9b4fafb0ca1172eebffb590c52a355be59ec3f8",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
    "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
    "sha256:41ca1a14bf175356380f2590c599ce70890774d8292e42bc4c9299da7219b542",
    "sha256:61e957296d6b62e50caca4b67e97af6ac168afa0592a50206c1008e94177802d"
   ]
  },
  {
   "name": "sha256:a1691a41ddeb091310d9a67b5e720a31dedad11d94c8ecc136dc4487c4f162a3",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:a1691a41ddeb091310d9a67b5e720a31dedad11d94c8ecc136dc4487c4f162a3",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
    "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
    "sha256:76570aa0dade2f2ae737714bb94a93fa1c69060d35066c2b944978535452326b",
    "sha256:cdf0bb5d277eb2811da243ecfcf7873c3282a9a4a2b455b0c5de3a62725c3c0a"
   ]
  },
  {
   "name": "sha256:6974ffb36403ddee403ae654da11bc1ac8f6c51cf7113026a1ae1c456878688d",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:6974ffb36403ddee403ae654da11bc1ac8f6c51cf7113026a1ae1c456878688d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
    "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
    "sha256:a0b90c657a782bdfdf74017bf99ca8a8a0950db82628a18b0ab4092bd020f963",
    "sha256:7616b8e10307e313d049953d83b1feae4a104a676f8063987133d11cd4c79626"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:b8109aa8cb1f87d52afdfcb3e87382e197ca5983121409a6aaa1c7340004cc19",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:b8109aa8cb1f87d52afdfcb3e87382e197ca5983121409a6aaa1c7340004cc19",
   "tagSymlink": "40e61e6",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:22eaf1d54ca67731874c5b3fa1acdb3af194e2ee1d44ce96be15730e73db715d",
    "sha256:4bf2e662e2e60904de44f770f9b4fafb0ca1172eebffb590c52a355be59ec3f8",
    "sha256:a1691a41ddeb091310d9a67b5e720a31dedad11d94c8ecc136dc4487c4f162a3",
    "sha256:6974ffb36403ddee403ae654da11bc1ac8f6c51cf7113026a1ae1c456878688d"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/kubernetes-nmstate-rhel8-operator@sha256:5cc328a8ae414ef603ed9667ae10a85ae7bda12f2bb1404c80771245504eeab6",
   "path": "openshift4/kubernetes-nmstate-rhel8-operator",
   "id": "sha256:5cc328a8ae414ef603ed9667ae10a85ae7bda12f2bb1404c80771245504eeab6",
   "tagSymlink": "b66c5da8",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:7b29706a171532218b07b5de5fe5d6470c5064a3317116a35fc3587af133b5ff",
    "sha256:c26e7ecb2b856914ea8582e225b0b10a940c84cb91502492f8e59172525fdca9",
    "sha256:40544856b520307617f6b45787beca29e8f7f03a10d72128867b9c471ccd9cad",
    "sha256:7450966bf250b2f624979a21ecc4663bfe29b29c61ae23a0b43bcdd9e5c4a759"
   ]
  },
  {
   "name": "sha256:7b29706a171532218b07b5de5fe5d6470c5064a3317116a35fc3587af133b5ff",
   "path": "openshift4/kubernetes-nmstate-rhel8-operator",
   "id": "sha256:7b29706a171532218b07b5de5fe5d6470c5064a3317116a35fc3587af133b5ff",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
    "sha256:b56af1360c83e0a0479bf161b3ec392c8c513f8e8104700c8ed696fe4b261c8d",
    "sha256:a14ea5d92d3bde28fdb2217430366523f3c432d6b26c54be4405adffe70c4193",
    "sha256:29de1d58b14e4d13c1c5ea45db530da00e07368da4a85d02305857796228b2b4"
   ]
  },
  {
   "name": "sha256:c26e7ecb2b856914ea8582e225b0b10a940c84cb91502492f8e59172525fdca9",
   "path": "openshift4/kubernetes-nmstate-rhel8-operator",
   "id": "sha256:c26e7ecb2b856914ea8582e225b0b10a940c84cb91502492f8e59172525fdca9",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
    "sha256:74f1fb7a06eab765809ca437e035b054dcfb1e6ecb3158ecc8a9076b6f26210f",
    "sha256:2d42c3d2dc6d9db72456998cef579018c22932c2ed0752706ccf9110b0721090",
    "sha256:6399fe015b69f635349cc8d843ce90682a94aa1178b677d03ccc4eacdbed167e"
   ]
  },
  {
   "name": "sha256:40544856b520307617f6b45787beca29e8f7f03a10d72128867b9c471ccd9cad",
   "path": "openshift4/kubernetes-nmstate-rhel8-operator",
   "id": "sha256:40544856b520307617f6b45787beca29e8f7f03a10d72128867b9c471ccd9cad",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
    "sha256:9510f581bc6968bd3717fd248986be74458e606ee275a794d769df8d1e544640",
    "sha256:4532282f4c82ed8e9dda0f817a784b5f81faf0dc1b0d1a2c732fd4ca22d99dfa",
    "sha256:91d5050a10c223cb44c4d3de687f7ed700471d8131a612e9477385e092f1b649"
   ]
  },
  {
   "name": "sha256:7450966bf250b2f624979a21ecc4663bfe29b29c61ae23a0b43bcdd9e5c4a759",
   "path": "openshift4/kubernetes-nmstate-rhel8-operator",
   "id": "sha256:7450966bf250b2f624979a21ecc4663bfe29b29c61ae23a0b43bcdd9e5c4a759",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
    "sha256:39504606388e1d44d94d8a1b2d37e37c80a5453590aaa0ec5b1c8b510a77750f",
    "sha256:bfe71d33d0cf5feeaa9c7a4a517230ba421ce9e697c41998e377a18e27a29760",
    "sha256:1b9cd96f42f7a7d4203860e4059a24759fb54592d4182fb115253e0f596fd8b4"
   ]
  },
  {
   "name": "sha256:1bf1045a01f635107d56b8cb4cb9ee53edbe601ab2c2a2f2764cde32a8af6d07",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:1bf1045a01f635107d56b8cb4cb9ee53edbe601ab2c2a2f2764cde32a8af6d07",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:48ab3c8e50d20b459583e01f46d23c8425648e3625f5973e2ade51195fbec58a",
    "sha256:1c407a140f09910093079e804df0ec64cd5bd52aa5ad1b4e84676a5a3bbbdc86"
   ]
  },
  {
   "name": "sha256:af6d30759c2a1163149d04caf0392c783ac0f55f8dc5aa2a2e85b0d0ddbf5ffc",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:af6d30759c2a1163149d04caf0392c783ac0f55f8dc5aa2a2e85b0d0ddbf5ffc",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:2773d6386e4956d281b2e01005dd0004f7046b1bbe67f872276619ecd7b2cdd8",
    "sha256:a348a702b9307e0641711d86ce3efa7ac4c61fb342e5371ebace869daebaa6ea"
   ]
  },
  {
   "name": "sha256:decdc667829098ed2d677f0b429582d9957f8cce6477962ffd46e2d67cf66884",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:decdc667829098ed2d677f0b429582d9957f8cce6477962ffd46e2d67cf66884",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:3f8c7babd8aacf51d5e5ecf250cfc4c50cab9f0c7df0653d77b5c1484c1c319d",
    "sha256:94868538692ada32b0f4bc8456e8622c7c236f0e281789ebc09040885e40d003"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:40192e6b43abb91b01cfb12e9c6c2132b529c8a52b0ee0c4a4e5502337d1135e",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:40192e6b43abb91b01cfb12e9c6c2132b529c8a52b0ee0c4a4e5502337d1135e",
   "tagSymlink": "80e520fb",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:1bf1045a01f635107d56b8cb4cb9ee53edbe601ab2c2a2f2764cde32a8af6d07",
    "sha256:af6d30759c2a1163149d04caf0392c783ac0f55f8dc5aa2a2e85b0d0ddbf5ffc",
    "sha256:decdc667829098ed2d677f0b429582d9957f8cce6477962ffd46e2d67cf66884"
   ]
  },
  {
   "name": "sha256:84e5dec6cc27b7c738d2465e7e999d1af2012dd3f825be118b47dcb5dca37dc6",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:84e5dec6cc27b7c738d2465e7e999d1af2012dd3f825be118b47dcb5dca37dc6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
    "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
    "sha256:7dd41fb0b4e577cf7bac7926964cb047a679bd743be1e6b3d82a965920a955ef",
    "sha256:105500e29232139ff2d3d199cb3df133c21bb64e5bfd03392c995e1cf09cc710"
   ]
  },
  {
   "name": "sha256:46a42ee35b022e514ca90a658216ab1875d364cfefab477c36701ec5e6695b8c",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:46a42ee35b022e514ca90a658216ab1875d364cfefab477c36701ec5e6695b8c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
    "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
    "sha256:550324c9b0b4b0a46b91e9089663864ecaf21be53f8a655ce22c42baedec4b45",
    "sha256:64c38c3cb4aabfef0d8c1ad437ee6393a3717234840863415ba823d35f481030"
   ]
  },
  {
   "name": "sha256:7d2f4e2249d1710dd89af2f6e9691bcf352998d97a08145ecbd16e994e623b0e",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:7d2f4e2249d1710dd89af2f6e9691bcf352998d97a08145ecbd16e994e623b0e",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
    "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
    "sha256:e29974a13056c7a26f9b9bd54deb4a78bda7a7ea27984d1de838905116565156",
    "sha256:13f6cf0475761fe9577a9c597d7bb93daf9224d95acf68513625062cb87497f4"
   ]
  },
  {
   "name": "sha256:abd620117a5743682ccc9e8e46046d8838a525fbb6527232cdede8d4d00360c8",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:abd620117a5743682ccc9e8e46046d8838a525fbb6527232cdede8d4d00360c8",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
    "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
    "sha256:ee634b1d79169672ad22cc0eee1ccee30253fdb7a2af4e329ccf2fa7c44c6697",
    "sha256:30b69b33a97523412505e971fc70af7da94ac3d9733d2523054bb066bea94094"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-snapshotter@sha256:84982def260a1f03a0299528182951993d5c105676c7dd7fe502d12fa167aaae",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:84982def260a1f03a0299528182951993d5c105676c7dd7fe502d12fa167aaae",
   "tagSymlink": "6e43226",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:84e5dec6cc27b7c738d2465e7e999d1af2012dd3f825be118b47dcb5dca37dc6",
    "sha256:46a42ee35b022e514ca90a658216ab1875d364cfefab477c36701ec5e6695b8c",
    "sha256:7d2f4e2249d1710dd89af2f6e9691bcf352998d97a08145ecbd16e994e623b0e",
    "sha256:abd620117a5743682ccc9e8e46046d8838a525fbb6527232cdede8d4d00360c8"
   ]
  },
  {
   "name": "sha256:057faab26a423611a690f90ad525a2452a4a78dcfbcf1d5563110cccdc9b3f3b",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:057faab26a423611a690f90ad525a2452a4a78dcfbcf1d5563110cccdc9b3f3b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:0a06c35b757c03ce6846267a97bf28da46ac26dd82bd3f39689e29f8af4fc4bd",
    "sha256:5bed39d73bd4d86abcbbe97ee6f74b99b3d6d9258d512eeaafbdf8578435cac7"
   ]
  },
  {
   "name": "sha256:b73a21003a203ed398858ca8d6ce3a91f8c63412f8ab9be43f0de75235aa6941",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:b73a21003a203ed398858ca8d6ce3a91f8c63412f8ab9be43f0de75235aa6941",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:b9b8907c867eaa8a63f45cbdc01707758067626644a2cb41f28fdfd9eb38006b",
    "sha256:204d1db375e6f107b1a5822ace25ca2b9e778c86fc2a9e7eb09bcba4044eaf47"
   ]
  },
  {
   "name": "sha256:6ef935f1f158d5557a4a200796e08b43c619e4c0c38eefce54b18d4ffda8140d",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:6ef935f1f158d5557a4a200796e08b43c619e4c0c38eefce54b18d4ffda8140d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:2f097c75a4f341c2d39faa688c17d64ab1e9933bb07d7f7a8f9a0cc43bbd6b3d",
    "sha256:ff3ae85b6432c91ebf4dd54c5e6a0f5db8a74c9b76ab6ba247d69053aafd84fa"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:3b359006d7b17b3416f9b29dad7bc35e26c6d0d21feacdb71282514b2c76e151",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:3b359006d7b17b3416f9b29dad7bc35e26c6d0d21feacdb71282514b2c76e151",
   "tagSymlink": "47650600",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:057faab26a423611a690f90ad525a2452a4a78dcfbcf1d5563110cccdc9b3f3b",
    "sha256:b73a21003a203ed398858ca8d6ce3a91f8c63412f8ab9be43f0de75235aa6941",
    "sha256:6ef935f1f158d5557a4a200796e08b43c619e4c0c38eefce54b18d4ffda8140d"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-attacher@sha256:7840134d92c918aa3e80f93d24630566be07b3afc16515d5525217e554e8f35d",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:7840134d92c918aa3e80f93d24630566be07b3afc16515d5525217e554e8f35d",
   "tagSymlink": "d0755c38",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:1ec2ea55d1f56012b9a377a223289fedc9f41f9808e2242cdb2c677ad0594f7e",
    "sha256:0d5449cd9554cffa8f9ad57f59782462432138b95c81f407f5fb14095892fb84",
    "sha256:39f23d00e86e0493045e1514febd943a728ae23ad60f32c6b234816fa3a11aa6",
    "sha256:40c814736c53fca7d22a85ba0eb52c5c27f861926534349ec53ee2e090fbcc7e"
   ]
  },
  {
   "name": "sha256:1ec2ea55d1f56012b9a377a223289fedc9f41f9808e2242cdb2c677ad0594f7e",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:1ec2ea55d1f56012b9a377a223289fedc9f41f9808e2242cdb2c677ad0594f7e",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
    "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
    "sha256:7e04dd2fac6a4e1be66f1c90337446c9dad3daa1cdeedcab174144ccf672a433",
    "sha256:1a0db6f18829ea8c73d65dba5323f3a533a0a01c1ba9aefb6ad6f604fe970fe0"
   ]
  },
  {
   "name": "sha256:0d5449cd9554cffa8f9ad57f59782462432138b95c81f407f5fb14095892fb84",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:0d5449cd9554cffa8f9ad57f59782462432138b95c81f407f5fb14095892fb84",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
    "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
    "sha256:5f16b6cef155e9af91edf621a7426bd3def8eff638c4638469793f5809c916a3",
    "sha256:33c01a77ba98b7920df9a756f6105b26c1b603a5a79455df4c5bf2ae13d018d2"
   ]
  },
  {
   "name": "sha256:39f23d00e86e0493045e1514febd943a728ae23ad60f32c6b234816fa3a11aa6",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:39f23d00e86e0493045e1514febd943a728ae23ad60f32c6b234816fa3a11aa6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
    "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
    "sha256:e2f74835a7c4ed1637142d9428e017c24b493f7b6f5885097fb493f2ceb0ff19",
    "sha256:b4b26d17441526d034dff72f2858fae58d78742267924efce6bb2ec61c255bfa"
   ]
  },
  {
   "name": "sha256:40c814736c53fca7d22a85ba0eb52c5c27f861926534349ec53ee2e090fbcc7e",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:40c814736c53fca7d22a85ba0eb52c5c27f861926534349ec53ee2e090fbcc7e",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
    "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
    "sha256:7126833b4cf18e5dee4f8cc42781cab7d6a61ad1a608a731704014de37063472",
    "sha256:e3c306cfc117a2dbbe8621dcdb53e2da8ec1cd6e9acdf647f6d42edd4d29ea94"
   ]
  },
  {
   "name": "sha256:35af8575a35635d3414d8867cdca36c9edd60e7ac5e62ac107401e5832521736",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:35af8575a35635d3414d8867cdca36c9edd60e7ac5e62ac107401e5832521736",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
    "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
    "sha256:77c49897e876b9f52c471a5e2e6db4648846ca6fda2f51d9bd03662517522e88",
    "sha256:2193b2133dbf69a40e12cf1fef6bd61807e09051ee18412451aed5e5931dee5c"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-snapshotter@sha256:cb781aff7b4ead2e0535274186b5e97274d734e19e9ef404e187bc39d11bb2cc",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:cb781aff7b4ead2e0535274186b5e97274d734e19e9ef404e187bc39d11bb2cc",
   "tagSymlink": "dda988d8",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:57433dbdadcd05b83c67b11f2f841a0cb6ee946a76c8d31c0c20366913ceb13c",
    "sha256:3e03fde9edf45d02e3b3bd4174624e6c5cac906164c9b4a71326cb48c6b417b6",
    "sha256:594ed3b3ba781e14e41d2cf280b6e750577c1fb3a2e8705d075d6e42a0d62aa6",
    "sha256:35af8575a35635d3414d8867cdca36c9edd60e7ac5e62ac107401e5832521736"
   ]
  },
  {
   "name": "sha256:57433dbdadcd05b83c67b11f2f841a0cb6ee946a76c8d31c0c20366913ceb13c",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:57433dbdadcd05b83c67b11f2f841a0cb6ee946a76c8d31c0c20366913ceb13c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
    "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
    "sha256:537923d8664825e1717cb0aef4a874b18949378bcb049a0616f534a136f3d134",
    "sha256:322793899b82cedef9e0c449b5ad00edb965245e132c68ce5cdecfa8697d2aad"
   ]
  },
  {
   "name": "sha256:3e03fde9edf45d02e3b3bd4174624e6c5cac906164c9b4a71326cb48c6b417b6",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:3e03fde9edf45d02e3b3bd4174624e6c5cac906164c9b4a71326cb48c6b417b6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
    "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
    "sha256:ccbd47ddd88ffae841c82627948300d6481bdfb9d7b3f8c321c19c9b1c942ae3",
    "sha256:69440cfd5e902e3ad95bdf462ecf6576bd1e48daac9532bf2ef3f4b5abfeb4de"
   ]
  },
  {
   "name": "sha256:594ed3b3ba781e14e41d2cf280b6e750577c1fb3a2e8705d075d6e42a0d62aa6",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:594ed3b3ba781e14e41d2cf280b6e750577c1fb3a2e8705d075d6e42a0d62aa6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
    "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
    "sha256:0da8ea96811e3af7a02a4b94a8a97a964fdcad70a1f14455a969bd1a41e298f3",
    "sha256:92d92026317ab223f447875a41716b4dd3821e42c67a2c044577f10bdcc52307"
   ]
  },
  {
   "name": "sha256:74d9f6ff54a22e2b9174af3dee084e40ed7091a8b7a4075f5343415f23ca59c7",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:74d9f6ff54a22e2b9174af3dee084e40ed7091a8b7a4075f5343415f23ca59c7",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8ae94d44715e38323c503f34985d4dae431ad8c200aaffd1806ec5c6b2f9c2f",
    "sha256:d2476c1919664b73a98495ff6e8d395a5c7cd0a461f1c80d6eb985d1c001303e",
    "sha256:cd04d6eaa056b65dcc08032c5d40e7bfba43a93e0dace3a2af02dc13dcee7017",
    "sha256:a5030821dfa905e8dff87b6a1727d2e6f2b4f47ff46febcb0c17964eba809912"
   ]
  },
  {
   "name": "sha256:b47a04594a1dd6074eaca096b1c5209c369d53dfba601a1be4b1149a967579ad",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:b47a04594a1dd6074eaca096b1c5209c369d53dfba601a1be4b1149a967579ad",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e9459e3a98cc790007c3680dd8b292ea532d820ea8cbdf02344fe6c370d82a95",
    "sha256:f3992bbd282187c79c59ab9612f11590577b44953233c624e1700082117db955",
    "sha256:f3f2d9b9fa1ca1891520d2dbc1a0e79ceae3521196ebe5673a7cafac0e08b7d9",
    "sha256:956aef7f0a73f20291792e142b1eb920693f3ae97ff129f627f31bb59d769c67"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:7de13e9bc57cf408d805b91eba5d6062407bc725aed03aadf1905874a9580d88",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:7de13e9bc57cf408d805b91eba5d6062407bc725aed03aadf1905874a9580d88",
   "tagSymlink": "21b9a7f2",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:bf7abafebdc61929688d81849954afe39f365592926432d143622a2349e18b3e",
    "sha256:74d9f6ff54a22e2b9174af3dee084e40ed7091a8b7a4075f5343415f23ca59c7",
    "sha256:b47a04594a1dd6074eaca096b1c5209c369d53dfba601a1be4b1149a967579ad"
   ]
  },
  {
   "name": "sha256:bf7abafebdc61929688d81849954afe39f365592926432d143622a2349e18b3e",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:bf7abafebdc61929688d81849954afe39f365592926432d143622a2349e18b3e",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:1e09a5ee0038fbe06a18e7f355188bbabc387467144abcd435f7544fef395aa1",
    "sha256:0d725b91398ed3db11249808d89e688e62e511bbd4a2e875ed8493ce1febdb2c",
    "sha256:f067a2171519f6efa558f247bcc4c83245e5171d2febd0708e133308319340a6",
    "sha256:e45d4806fc5a2adf1d77e7cac12fb77b4f93c696635fa5a21a5fe8f8b03ec06a"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-kubernetes-nmstate-handler-rhel8@sha256:de064d2fa68307da23438c52b04d5ba50fb22c906d986f6c7a240ebd3c251d00",
   "path": "openshift4/ose-kubernetes-nmstate-handler-rhel8",
   "id": "sha256:de064d2fa68307da23438c52b04d5ba50fb22c906d986f6c7a240ebd3c251d00",
   "tagSymlink": "f032d23e",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:2b428f848c3c30f7dd16cd4da4ebe975177d79584ae3f2ed1192cfe3114b6d5d",
    "sha256:fe88d68fc947c48ede58614099198fe6035b12ea5ff9a13ba14135626ed09929",
    "sha256:90e8ccd16ffcef352f39f29ebb947922f43dd199363ae6a14a64adabafc732db",
    "sha256:24f00854dd5933569a69df2458eb49e18fab65988f25fa917ab8736d42bc9b96"
   ]
  },
  {
   "name": "sha256:2b428f848c3c30f7dd16cd4da4ebe975177d79584ae3f2ed1192cfe3114b6d5d",
   "path": "openshift4/ose-kubernetes-nmstate-handler-rhel8",
   "id": "sha256:2b428f848c3c30f7dd16cd4da4ebe975177d79584ae3f2ed1192cfe3114b6d5d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
    "sha256:b56af1360c83e0a0479bf161b3ec392c8c513f8e8104700c8ed696fe4b261c8d",
    "sha256:15224fd656bf18db922883d875fd975ccd463b56a97a0e40b21b86f2dbdf0609",
    "sha256:2bf640e207dba4c5d5eaa001ee0dc60b958b5641a80f6b2fa82f3044650a90d1"
   ]
  },
  {
   "name": "sha256:fe88d68fc947c48ede58614099198fe6035b12ea5ff9a13ba14135626ed09929",
   "path": "openshift4/ose-kubernetes-nmstate-handler-rhel8",
   "id": "sha256:fe88d68fc947c48ede58614099198fe6035b12ea5ff9a13ba14135626ed09929",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
    "sha256:74f1fb7a06eab765809ca437e035b054dcfb1e6ecb3158ecc8a9076b6f26210f",
    "sha256:cbeff04a27e7830818307182fc7a07de87676ac607f3bdbf4db0c3625e584374",
    "sha256:8b3ba32b0f56efc902f878c204bbbc97136ba4b5eb57bdcf60ce0639b10efe5f"
   ]
  },
  {
   "name": "sha256:90e8ccd16ffcef352f39f29ebb947922f43dd199363ae6a14a64adabafc732db",
   "path": "openshift4/ose-kubernetes-nmstate-handler-rhel8",
   "id": "sha256:90e8ccd16ffcef352f39f29ebb947922f43dd199363ae6a14a64adabafc732db",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
    "sha256:9510f581bc6968bd3717fd248986be74458e606ee275a794d769df8d1e544640",
    "sha256:a70dbbf8b5d3c55e64ea8023460db2def80963b48ee26fde65958fe2f26fc4a9",
    "sha256:64c71b2b8ac5662b4e352e762e6f11957dc58a0574eb6221135386082578a170"
   ]
  },
  {
   "name": "sha256:24f00854dd5933569a69df2458eb49e18fab65988f25fa917ab8736d42bc9b96",
   "path": "openshift4/ose-kubernetes-nmstate-handler-rhel8",
   "id": "sha256:24f00854dd5933569a69df2458eb49e18fab65988f25fa917ab8736d42bc9b96",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
    "sha256:39504606388e1d44d94d8a1b2d37e37c80a5453590aaa0ec5b1c8b510a77750f",
    "sha256:64fa3d4acb710554e1b12035498c2599d6631de057c210ecee6f335a2b2f4c85",
    "sha256:3400dec63d69193601f03017df1b5a8a7c11dd25faa323777c4eb9f8598966f6"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-operator-bundle@sha256:b89625d39585def00c85fb7d267000cd205cfdec8d391382b7bc6c1bb8241b7a",
   "path": "odf4/odf-csi-addons-operator-bundle",
   "id": "sha256:b89625d39585def00c85fb7d267000cd205cfdec8d391382b7bc6c1bb8241b7a",
   "tagSymlink": "4ecf0d1a",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0815bc1b7ce639a8b4fe3b807355cca5ea4c19e90f3e599b6f238f8f2f11cc42",
    "sha256:1a7f1b1ca3099b791fabafc809a83737f0ca27f01e2020baa8e6af50f87d42b0"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:4bed96d7bbbe247a6bf0b83bb3d9d174bbef10c9508f7f43bd1f6802022f32cd",
   "path": "odf4/mcg-operator-bundle",
   "id": "sha256:4bed96d7bbbe247a6bf0b83bb3d9d174bbef10c9508f7f43bd1f6802022f32cd",
   "tagSymlink": "43085e16",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:a017c9138bc3608e16f8e098213aec3ecf891f7e02fed747dcf8815d4819fbd2",
    "sha256:9bb38a02c754b6c3e680ab9f0426499b6e02eed03a77d2641369c78778523fb0"
   ]
  },
  {
   "name": "sha256:b1bdcee0cc29a06800cd4a965937880f025641012f2697330b96c3ae49d17717",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:b1bdcee0cc29a06800cd4a965937880f025641012f2697330b96c3ae49d17717",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
    "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
    "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
    "sha256:43f887c2c912f1fd47f22dc4c6835e9b6873c7ef9963419c4d1d308d2d3f526f"
   ]
  },
  {
   "name": "sha256:15def301d4edc0e13f3f8aaee042f557d83acd1972de6bc1b164224b5909d23e",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:15def301d4edc0e13f3f8aaee042f557d83acd1972de6bc1b164224b5909d23e",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
    "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
    "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
    "sha256:bae4501729af247337465486cacc54ec3e696c38cc4177c7bfbaf22afb8bfe04"
   ]
  },
  {
   "name": "registry.redhat.io/rhceph/rhceph-5-rhel8@sha256:5c75d05c7c532072ec97bba9951cc225bcb16c3f0c9ba9c0a293cb7a00b53b5a",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:5c75d05c7c532072ec97bba9951cc225bcb16c3f0c9ba9c0a293cb7a00b53b5a",
   "tagSymlink": "ebbb906b",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:cd029fe2e0cd0124d1ff91cafcb7a60b6fe7815fb929191579216ada912568dd",
    "sha256:b1bdcee0cc29a06800cd4a965937880f025641012f2697330b96c3ae49d17717",
    "sha256:15def301d4edc0e13f3f8aaee042f557d83acd1972de6bc1b164224b5909d23e"
   ]
  },
  {
   "name": "sha256:cd029fe2e0cd0124d1ff91cafcb7a60b6fe7815fb929191579216ada912568dd",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:cd029fe2e0cd0124d1ff91cafcb7a60b6fe7815fb929191579216ada912568dd",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
    "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
    "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
    "sha256:58cdca46f730e5d80b71a820bb70209ca30f44bae41f877de49cd57bd5d00c2c"
   ]
  },
  {
   "name": "sha256:9de4f6848556d362dab3fcc534a6e7098649b353139d1b8d796317b8474125c2",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:9de4f6848556d362dab3fcc534a6e7098649b353139d1b8d796317b8474125c2",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
    "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
    "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
    "sha256:57fdd7495851586b4f6cf5677ac8be6b46dd205ea0f853e3b4326b08962f3517",
    "sha256:aa81ad7ca7d9e5050e282444fdb0ead73be5cdc2ffa19d80677d353303744613"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:e686b5214871c516a7f5b6b03be43126de363c3c47630440a1dd2f42c2d49aee",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:e686b5214871c516a7f5b6b03be43126de363c3c47630440a1dd2f42c2d49aee",
   "tagSymlink": "123ba8ef",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:d828aab4db3bb853a9c2be53ef65e968e7dca8faacb480e9c6802093181a8f16",
    "sha256:f41411e6c6d65e52a3e3bb6cf3582116646e8ebc4ae9bf8eac77a00433855b20",
    "sha256:9de4f6848556d362dab3fcc534a6e7098649b353139d1b8d796317b8474125c2"
   ]
  },
  {
   "name": "sha256:d828aab4db3bb853a9c2be53ef65e968e7dca8faacb480e9c6802093181a8f16",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:d828aab4db3bb853a9c2be53ef65e968e7dca8faacb480e9c6802093181a8f16",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
    "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
    "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
    "sha256:7352f6cea50f341954464f598ddf182fd414905a0b3cc020549825ce4eccb4ed",
    "sha256:331b043fd43034caacd17a71f6de0c62323033f4cafb9fdbf056f6142610c1d2"
   ]
  },
  {
   "name": "sha256:f41411e6c6d65e52a3e3bb6cf3582116646e8ebc4ae9bf8eac77a00433855b20",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:f41411e6c6d65e52a3e3bb6cf3582116646e8ebc4ae9bf8eac77a00433855b20",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
    "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
    "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
    "sha256:b4198b1ff04aa2895ea9fb561adcb5df449c704e7f12d9c553b23cbb001d52f6",
    "sha256:433973506b0b8542d3e99ec17a3d438f1986580e1efc0d9f9f1e251e4822290f"
   ]
  },
  {
   "name": "sha256:a4281fc7ec884c80896e5e3f976042233e78e7055ed2fa973b755a6c8c84fd8f",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:a4281fc7ec884c80896e5e3f976042233e78e7055ed2fa973b755a6c8c84fd8f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
    "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
    "sha256:c8ee32327818966e1456f824c1fef1332c7a039eeb40c6b75c5ee1ad8ac956ed",
    "sha256:3d0b0c2fcbd4a7dfbddddd178646b669d1ecf552ef8c80b0411b2c636df092cb"
   ]
  },
  {
   "name": "sha256:01b68866f8426559e3287f8c23ac5a9f01eea566d65257d1d6c972c9f6e95e7d",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:01b68866f8426559e3287f8c23ac5a9f01eea566d65257d1d6c972c9f6e95e7d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
    "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
    "sha256:0e82e4b20943092f7035da9b8b081e7186c82d27c7a64baf921fd99679019d97",
    "sha256:1b95a7dc55895caa0f0697c501d98943ad13b12a27268a22f7039a5bf7374293"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-rhel8-operator@sha256:38eb3ad7e6c186e6a6ea06d7bf080601526a93c63aad538d67213904ae6a5db3",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:38eb3ad7e6c186e6a6ea06d7bf080601526a93c63aad538d67213904ae6a5db3",
   "tagSymlink": "37f6973f",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:809b9533510e33d478b7bd82ee8bf06f4b9843d140c400e90545fb2ecf7a3036",
    "sha256:a4281fc7ec884c80896e5e3f976042233e78e7055ed2fa973b755a6c8c84fd8f",
    "sha256:01b68866f8426559e3287f8c23ac5a9f01eea566d65257d1d6c972c9f6e95e7d"
   ]
  },
  {
   "name": "sha256:809b9533510e33d478b7bd82ee8bf06f4b9843d140c400e90545fb2ecf7a3036",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:809b9533510e33d478b7bd82ee8bf06f4b9843d140c400e90545fb2ecf7a3036",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
    "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
    "sha256:8a9f981d1a2d205a822c7b460605d5b8415865998e59dd99bf03f11112ae3c8f",
    "sha256:4a3d9af02f2746e8b83ba365095fffde31c98abe2c99d4db4b6576396cfc3cd2"
   ]
  },
  {
   "name": "sha256:0f5de60cbf4785719e0ff38f45810bb9f9bf3efef67d42f431161266849cbef9",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:0f5de60cbf4785719e0ff38f45810bb9f9bf3efef67d42f431161266849cbef9",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
    "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
    "sha256:f3bf45bda20aeeab91305b23ad5ce9f7206ec29fcee2e038aa0bb9b750578fca",
    "sha256:4cea1d7f8c57565501caecdaa3302983a7a849c80da9b50298298f85fd3ab52d"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:550221e4c4ddb57da3a811f5bdda5003079670fe84ebd7e74d3ce4177d5ea831",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:550221e4c4ddb57da3a811f5bdda5003079670fe84ebd7e74d3ce4177d5ea831",
   "tagSymlink": "740a4fac",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:ab9906801e3f605ceb0f6c420099ca4e011d0a81d2093c23eb9cd3e3f04295a6",
    "sha256:34bfe91b29d5acb807ce6cbf1337d07aa713e48bc9d7dc9db1fc220a14d5ec37",
    "sha256:0f5de60cbf4785719e0ff38f45810bb9f9bf3efef67d42f431161266849cbef9"
   ]
  },
  {
   "name": "sha256:ab9906801e3f605ceb0f6c420099ca4e011d0a81d2093c23eb9cd3e3f04295a6",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:ab9906801e3f605ceb0f6c420099ca4e011d0a81d2093c23eb9cd3e3f04295a6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
    "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
    "sha256:3d87d1870b9dcc9348ebdc921ff709e8591de06d0b92f2e86a0c8de6455c34de",
    "sha256:d4ca04606a80d42aef561157f2d87fe96f33d15294c453eda9ed5c579f47736e"
   ]
  },
  {
   "name": "sha256:34bfe91b29d5acb807ce6cbf1337d07aa713e48bc9d7dc9db1fc220a14d5ec37",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:34bfe91b29d5acb807ce6cbf1337d07aa713e48bc9d7dc9db1fc220a14d5ec37",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
    "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
    "sha256:e9f9ac5b11c0bc506e5241848bb1d391a8849ace373e007145d97dbb6b9109bc",
    "sha256:f4f5c60beda6d7b0fc6f48358ffa89968a23432ca9880f589f5c4166eae70029"
   ]
  },
  {
   "name": "sha256:7dc93a9627bf75b2fbfdde6b93d886d41f2f25f2026136e9a93d92de8c8913b9",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:7dc93a9627bf75b2fbfdde6b93d886d41f2f25f2026136e9a93d92de8c8913b9",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:3d4679d6550ed04bed8f137eccb2f5198efb4491950ec50f15831eda1b6ad963",
    "sha256:854c5a1705725e2b9078068ed1340c8000accb605f2b01295d366fea6ca18079"
   ]
  },
  {
   "name": "sha256:a3a092408fce7b1cd7d6c321e266ff6603598924af14e375abfbacc6eb186bb7",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:a3a092408fce7b1cd7d6c321e266ff6603598924af14e375abfbacc6eb186bb7",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:abad6baafc4cb0a77e481dea4a8bc47a7ed5b5c944d494c18bfbec3aeba4e8cc",
    "sha256:f9e824c6a711e299f7c6ec88e76c9b5e949ba6ffc9d52024cf09521f12bb7654"
   ]
  },
  {
   "name": "sha256:b560b6906a4eff2b10883e180da37ab18046af6c4c918ba8fe931045dadcafef",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:b560b6906a4eff2b10883e180da37ab18046af6c4c918ba8fe931045dadcafef",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:ac3143d6092da265fe38fcde94e5aa790146bc14fc0580c8093e76bac041cda5",
    "sha256:b55f94f2be53b8322bdb867d1dc7c3560eb1e69778cc908b943afc803a669a1d"
   ]
  },
  {
   "name": "registry.redhat.io/rhceph/rhceph-5-rhel8@sha256:b20a05e20403da9775408fde0f10ba9c81c5610a3814db7786dd43ce4b2aba4a",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:b20a05e20403da9775408fde0f10ba9c81c5610a3814db7786dd43ce4b2aba4a",
   "tagSymlink": "abb353a2",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:7dc93a9627bf75b2fbfdde6b93d886d41f2f25f2026136e9a93d92de8c8913b9",
    "sha256:a3a092408fce7b1cd7d6c321e266ff6603598924af14e375abfbacc6eb186bb7",
    "sha256:b560b6906a4eff2b10883e180da37ab18046af6c4c918ba8fe931045dadcafef"
   ]
  },
  {
   "name": "sha256:daf64c7005798c8239ff3e6801f1d3c69ff563b6c95ac6e31ccdadbd4603350d",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:daf64c7005798c8239ff3e6801f1d3c69ff563b6c95ac6e31ccdadbd4603350d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:b99d042fdbefe3cbfa9cbfed211a268e7c307232cbcc8705ef5b2c35bbd825d4",
    "sha256:8c25d059daf927573ab28a75b97611540bf6bddb151fceb4e38b29c9f8c3ba34"
   ]
  },
  {
   "name": "sha256:1ae91decb717658d1b7f11c9f809bb130ca95d4b63432a2526ee9d7e3d76f1a0",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:1ae91decb717658d1b7f11c9f809bb130ca95d4b63432a2526ee9d7e3d76f1a0",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:23ca1a413c368b88201ae1a3b404f8304f89141f755203a6105916eca083b15f",
    "sha256:059ad462c9cef0b2be3a12887c50178baf24311516171708b2cd3a3259596b4d"
   ]
  },
  {
   "name": "sha256:76432a36068b7d8a7572be30ea087914bf7407d09c594ba6f105a1219dc9fea2",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:76432a36068b7d8a7572be30ea087914bf7407d09c594ba6f105a1219dc9fea2",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:e0853528cf7a15b9abc6cd3bd091b95c28bfdcc3dadab9fbf21f1fe5bdddbe0a",
    "sha256:c59f889de84470b05859b2a22cbb101d8a8d8614061d710aee99b550b0b94b4c"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-sidecar-rhel8@sha256:84e379d6eef40ca05830c29fad2f2a5c15dd7158e9dd1277105e276413859144",
   "path": "odf4/odf-csi-addons-sidecar-rhel8",
   "id": "sha256:84e379d6eef40ca05830c29fad2f2a5c15dd7158e9dd1277105e276413859144",
   "tagSymlink": "181d4462",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:daf64c7005798c8239ff3e6801f1d3c69ff563b6c95ac6e31ccdadbd4603350d",
    "sha256:1ae91decb717658d1b7f11c9f809bb130ca95d4b63432a2526ee9d7e3d76f1a0",
    "sha256:76432a36068b7d8a7572be30ea087914bf7407d09c594ba6f105a1219dc9fea2"
   ]
  },
  {
   "name": "sha256:f6e545aa34174b5861a8c512aa40d411cc0e79cfe69d50aa6041d50540da96a4",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:f6e545aa34174b5861a8c512aa40d411cc0e79cfe69d50aa6041d50540da96a4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
    "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
    "sha256:5bef59fc23f7249e4024f8589174abf533ec95b54abdb9fdab33d6fcfe1f944f",
    "sha256:51608620df5baca0ea8875e02b63f8aa19bd0a635a51a49fc6a44d8cbfaa7a94"
   ]
  },
  {
   "name": "sha256:d763aa02b44ad13031bac316dd6bcc40b9a6202439131c200fa667ee7ca078ed",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:d763aa02b44ad13031bac316dd6bcc40b9a6202439131c200fa667ee7ca078ed",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
    "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
    "sha256:952b3f4a49f998fc4bba154b90d40f224480c9bd1950add9bc2ec77891a56779",
    "sha256:c4c8a311ff97d61087c8feef66050ee6d4c6b5133da1f21804405ed06c8b5c20"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-resizer@sha256:34386f8c0227015c1abd9d7dfd8e9b687cba7047ec021d393ab39133e67178b9",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:34386f8c0227015c1abd9d7dfd8e9b687cba7047ec021d393ab39133e67178b9",
   "tagSymlink": "fbc6ecae",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:f8e8253ab40975fc3b8b7c94e51aa0128eff7ca3aabafd0668d87e2e9f7ac66d",
    "sha256:71b85d6c84c0a0c2f4d3249b802a51ce427ac6216fca24fabe9650028e24ccdc",
    "sha256:f6e545aa34174b5861a8c512aa40d411cc0e79cfe69d50aa6041d50540da96a4",
    "sha256:d763aa02b44ad13031bac316dd6bcc40b9a6202439131c200fa667ee7ca078ed"
   ]
  },
  {
   "name": "sha256:f8e8253ab40975fc3b8b7c94e51aa0128eff7ca3aabafd0668d87e2e9f7ac66d",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:f8e8253ab40975fc3b8b7c94e51aa0128eff7ca3aabafd0668d87e2e9f7ac66d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
    "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
    "sha256:7081d295ad8361d45d66588d84e6a9cf8eb4807d52c0340c5c4318b1cc7e5a06",
    "sha256:7ad0de68b31466f71ce7650e1b60ba7e3663b63277f09003883be3e89274df93"
   ]
  },
  {
   "name": "sha256:71b85d6c84c0a0c2f4d3249b802a51ce427ac6216fca24fabe9650028e24ccdc",
   "path": "openshift4/ose-csi-external-resizer",
   "id": "sha256:71b85d6c84c0a0c2f4d3249b802a51ce427ac6216fca24fabe9650028e24ccdc",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
    "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
    "sha256:e459b78b4d6a22346c75b1d6e14958bae7e75432d0f46fdac553f77695ce7392",
    "sha256:8efc8858a917638a88d5896286e308871a2965c9e4dff2414733eb38f1b2921e"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:a00e90621b5a6f94abd890c9ffa1dd9703f213b6a418b49570f692fb85affafb",
   "path": "odf4/odf-operator-bundle",
   "id": "sha256:a00e90621b5a6f94abd890c9ffa1dd9703f213b6a418b49570f692fb85affafb",
   "tagSymlink": "901ac434",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f1d580b90074dec76aec452264ecd20454ed205391ce01cdf38185726517fdc4",
    "sha256:ea46990d7f1233b30a43c6e1627929ea355962d24e2afc1c9407a331a85e401b"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:dedbaa13ec89f3f8217ed23722ae0589fedc96f319d61cd2a79c9afc66dce340",
   "path": "odf4/ocs-operator-bundle",
   "id": "sha256:dedbaa13ec89f3f8217ed23722ae0589fedc96f319d61cd2a79c9afc66dce340",
   "tagSymlink": "4057a22f",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:a3ffd3cce0012873c5057f6d87c5ffccc643d4bdbe4a9069ae51b3876d86fc63",
    "sha256:c4ffed10f5f2e7f43f28ebe815b82519a5a8f7935d38488cfa47c1d5f8adc898"
   ]
  },
  {
   "name": "sha256:e8bf5c9a2d748f76ddeba0fad9b9d53cabefdcf6cc9abaa8131e66e2c10a12bf",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:e8bf5c9a2d748f76ddeba0fad9b9d53cabefdcf6cc9abaa8131e66e2c10a12bf",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:ff99d0e715d7ebb71718b7ded665e27c6159c38e6b70d1567e86057337dbb59f",
    "sha256:2ccb32349a59a65194a3e028504daeaa40fd46701326f94d8d486a94ac145dd7",
    "sha256:7c09aa258efa0f1afbf6e69a446dfdf38ea9cc55081e802030f94c394a456ade",
    "sha256:a374e1d02001ccae2586e0a7f745ca15055f16d4ba65e9f41fbd5c8c340b7692"
   ]
  },
  {
   "name": "sha256:c76c79c9582c3173fb03316d428a931dee0d5a0f170196379fd666398ef7995c",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:c76c79c9582c3173fb03316d428a931dee0d5a0f170196379fd666398ef7995c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:559c72cd3197d49d4dcf17c6bcdfde28271133553d54348d541803fe13e26c8d",
    "sha256:0c17a6478c8036a2dcc526c9ea4e31b571d7d868974231786dbb1cabdd25c19f",
    "sha256:194efc41523556292bc2ccc99ca9c7fb848705b83945c05cdb67f1b185d239e5",
    "sha256:ab392a43178ddf39ee61be70a3ce0c5b4b6e054fcc4bc1beee52d1cacdb32c2f"
   ]
  },
  {
   "name": "sha256:2eec86a7b47ba1c2b6bec53bd1099cff94530d32679b3447219da0162c8b8b1f",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:2eec86a7b47ba1c2b6bec53bd1099cff94530d32679b3447219da0162c8b8b1f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:78ed7a18b734d81a674eeeacb661fd76839d06f1f4f9143aa44540acc268e663",
    "sha256:284adfe3f41e61248047a73f2269c3cd0711991c24a1d49bdea00c9a94cb4b5e",
    "sha256:df875a25b7f1f2107b18fbb11d8b840d31ef48c29b86e82e44005ad2bf361b8a",
    "sha256:dcf52c62d6f601a1fb53d18c096eef9b4e983afa417c33756d4008b9a670b72c"
   ]
  },
  {
   "name": "sha256:ddf26e62df798ba3558fcda98c4f9cc7f1e3b9fd59f7cd2125cecb6464afb2a2",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:ddf26e62df798ba3558fcda98c4f9cc7f1e3b9fd59f7cd2125cecb6464afb2a2",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:bcbb9c139f21f4cb20b1dc9952bfc4dc69cf00ace23167a67af6557aa74db74b",
    "sha256:65007467f7e378270e6b1ef49f143126540209b6ce5c450aaafef62076df0285",
    "sha256:04f7ea855908912d274c9da3aa2c85c794706372657e153bb0e54a58de5e8198",
    "sha256:e00a6f014aa8048d92713b5af401ca6a38ebe9714d00d0ea5866c1cac092f407"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-snapshotter@sha256:af51ccc5af0c59d3795f1872104a441edd79c2de93038076c697b35ec189bffb",
   "path": "openshift4/ose-csi-external-snapshotter",
   "id": "sha256:af51ccc5af0c59d3795f1872104a441edd79c2de93038076c697b35ec189bffb",
   "tagSymlink": "20c01092",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:e8bf5c9a2d748f76ddeba0fad9b9d53cabefdcf6cc9abaa8131e66e2c10a12bf",
    "sha256:c76c79c9582c3173fb03316d428a931dee0d5a0f170196379fd666398ef7995c",
    "sha256:2eec86a7b47ba1c2b6bec53bd1099cff94530d32679b3447219da0162c8b8b1f",
    "sha256:ddf26e62df798ba3558fcda98c4f9cc7f1e3b9fd59f7cd2125cecb6464afb2a2"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-local-storage-operator-bundle@sha256:c49ff0e65acaa9622e08101e38debfe7615bf46eb461d59f0c7e729c1195c961",
   "path": "openshift4/ose-local-storage-operator-bundle",
   "id": "sha256:c49ff0e65acaa9622e08101e38debfe7615bf46eb461d59f0c7e729c1195c961",
   "tagSymlink": "a79c9326",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:967c59406255f29fc9508219b2b1176d17dacc3f5d98bce8f419e66f7adce1b5",
    "sha256:17f6e9558b118b3890aeaa5eeafbaed5004bfc070ca22cabdf314f3465ffb0bf"
   ]
  },
  {
   "name": "sha256:a3328798bcc141bac38343cdbe6b702c7f3039e2f83a772a7fef9796650c22ee",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:a3328798bcc141bac38343cdbe6b702c7f3039e2f83a772a7fef9796650c22ee",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:3d4679d6550ed04bed8f137eccb2f5198efb4491950ec50f15831eda1b6ad963",
    "sha256:27495196c3d272e3a144ed681575993e152d5933b5c859f4c91e6041fcc92c93",
    "sha256:73e291e0193fc0ed8a2629cc8d8636e71963b48fa6e37248eb116af7da963e16"
   ]
  },
  {
   "name": "sha256:fdde8db0b341f856aa8de9178aee5ce5fee33e5d73421070e3bc0a2a5a49124f",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:fdde8db0b341f856aa8de9178aee5ce5fee33e5d73421070e3bc0a2a5a49124f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:abad6baafc4cb0a77e481dea4a8bc47a7ed5b5c944d494c18bfbec3aeba4e8cc",
    "sha256:0f19843c9f65781b094ecf100ef2544cbe719ebb726e9a514033200220aab81b",
    "sha256:92574ded95c3e4369221eff3857b6e97e258d5772f6ba0df5b7c92322bd76c31"
   ]
  },
  {
   "name": "sha256:6942c1479998e617cb71b27f4f870ed4392a12068ffa897e28f9c4805ebf4546",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:6942c1479998e617cb71b27f4f870ed4392a12068ffa897e28f9c4805ebf4546",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:ac3143d6092da265fe38fcde94e5aa790146bc14fc0580c8093e76bac041cda5",
    "sha256:5f999ab542b7e4082ada35420000d36a78b982bb4f440717844cfe2304da97bc",
    "sha256:46e554421127d48cd18a14d00d9502cd357e9bcf0a35937a784f0646b6320768"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:9c99f8318724c94346db4c9079705537ae177d276108bbc2e8c080fd95b58440",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:9c99f8318724c94346db4c9079705537ae177d276108bbc2e8c080fd95b58440",
   "tagSymlink": "df7c0f8f",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:a3328798bcc141bac38343cdbe6b702c7f3039e2f83a772a7fef9796650c22ee",
    "sha256:fdde8db0b341f856aa8de9178aee5ce5fee33e5d73421070e3bc0a2a5a49124f",
    "sha256:6942c1479998e617cb71b27f4f870ed4392a12068ffa897e28f9c4805ebf4546"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-node-driver-registrar@sha256:376f21cfa8308dc1b61a3e8401b7023d903eda768912699f39403de742ab88b1",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:376f21cfa8308dc1b61a3e8401b7023d903eda768912699f39403de742ab88b1",
   "tagSymlink": "c3a8ecf1",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:2782ad869eb429ed09f6929de0d9cafa7a84c4d2987ef09b41b80267660b04e1",
    "sha256:44d1260eaf1a934f137b43088079a31fe26a01c1091df6b2431a86939110c999",
    "sha256:437194af53596aa84065e5542817c9ff22ef1cba1dc4b6b0844f969ee78a4a76",
    "sha256:bbb30770829051fcb6402dfa2d95623b2d705975e30c87f0985edb0f8e5b32e1"
   ]
  },
  {
   "name": "sha256:2782ad869eb429ed09f6929de0d9cafa7a84c4d2987ef09b41b80267660b04e1",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:2782ad869eb429ed09f6929de0d9cafa7a84c4d2987ef09b41b80267660b04e1",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:df37870c9b590d1df90ae85c5186370452cb17de6e25f22b683b5f3a2f4dc1d5",
    "sha256:f70cb1865d54b2ff4ae0de4eccc872d16704750c6b1d03b9a61e68f9a7bcdab2",
    "sha256:e7d22c47e910d12cf6225056a0828560dc12c0d87c35c98b4cab327687e24cb6",
    "sha256:161662e2189a05d8972c853eb2f5f91c62746649119b3253cff65332cede4044"
   ]
  },
  {
   "name": "sha256:44d1260eaf1a934f137b43088079a31fe26a01c1091df6b2431a86939110c999",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:44d1260eaf1a934f137b43088079a31fe26a01c1091df6b2431a86939110c999",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:c5d3e9d04da547527166b014ef5b1b51dd27db6e97751402a3216a722d91938b",
    "sha256:d93b720495728f1cee2c55fd4a26df2ee0c0c0c701ec0b5d102cec7cdfa8b81b",
    "sha256:36836a28447a10b68aca0a91424144966e4de190a80268bf943718af1dd21738",
    "sha256:7a0e35b6c0311f071b30adc4d34715511dcbb1f9b32899cb6ad10b580266e111"
   ]
  },
  {
   "name": "sha256:437194af53596aa84065e5542817c9ff22ef1cba1dc4b6b0844f969ee78a4a76",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:437194af53596aa84065e5542817c9ff22ef1cba1dc4b6b0844f969ee78a4a76",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:83b9a3e31f66ae4870dba527e1686846c20dfe1c9e6a635da778e0bf1998b18b",
    "sha256:702ef9298ca1232dac05196b986338ea86079fc13bb2b91f52383a80f2ee9277",
    "sha256:6e586af64f277e618d68553b11fa25a935136265e3b65c3ec40b5dba90b5d53e",
    "sha256:8c7d8069337c40d9fb19166bbdf365ece17d05ba981a9833ebc157f3a0ec123d"
   ]
  },
  {
   "name": "sha256:bbb30770829051fcb6402dfa2d95623b2d705975e30c87f0985edb0f8e5b32e1",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:bbb30770829051fcb6402dfa2d95623b2d705975e30c87f0985edb0f8e5b32e1",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:da7a49ac4dec5ef965c4e115ee9e52980d89e33a92b51d02f66821d79d2dfb7a",
    "sha256:171fe1ee1b96d4b4be348366477d691189cc39379230942d3eccfe264b0c71b3",
    "sha256:75127a621485d83ed3912fe5edd28a37763cd185b62d2f408c47a34aac478b97",
    "sha256:2de6901de02c8a258c4f0cafc1988fbf2ce1aafea77c4c8a2a0365aec1c4017a"
   ]
  },
  {
   "name": "sha256:5e16ecbc471f13a88d6765b0833083361ca7b83aead711c1e266ecbc9ebd09b4",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:5e16ecbc471f13a88d6765b0833083361ca7b83aead711c1e266ecbc9ebd09b4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:b57a127d7cb70f5bfd3ffc655c49f4c0f6a776eb2ca2d717f963363da0733850",
    "sha256:45be7a8aa4b236a278c158854ff3f3216b06841340e370881c01b54cf2cbb19e"
   ]
  },
  {
   "name": "sha256:45949fe9484182da70a9372453e7bf02666580cd01c9d4af0404358b5d926262",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:45949fe9484182da70a9372453e7bf02666580cd01c9d4af0404358b5d926262",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:5ab1765f2b82b314c00dc97fe155c7658553fec29a616bf23f90a5bae4984bc7",
    "sha256:5c9a035308b152714b6a34829afc31586c15fbc00ade48e8d90a233263ee42a5"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:b1973f451d16bbe48a3bd1cba22019724c4de8252baf52c8f09239b8e7434e64",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:b1973f451d16bbe48a3bd1cba22019724c4de8252baf52c8f09239b8e7434e64",
   "tagSymlink": "a38faf14",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:cb9fa81ad202bfedb04bc3242ffd582d49f0e8094069cba17ba694a2f03170dc",
    "sha256:5e16ecbc471f13a88d6765b0833083361ca7b83aead711c1e266ecbc9ebd09b4",
    "sha256:45949fe9484182da70a9372453e7bf02666580cd01c9d4af0404358b5d926262"
   ]
  },
  {
   "name": "sha256:cb9fa81ad202bfedb04bc3242ffd582d49f0e8094069cba17ba694a2f03170dc",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:cb9fa81ad202bfedb04bc3242ffd582d49f0e8094069cba17ba694a2f03170dc",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:29456d9c1395da0c1137382990037cd7156529ab4f2f6ba7362c7831be0e5aba",
    "sha256:a533c8eb46bed38829bd955d62fcfc72a5b7462d7fcf577c8616eed95d77a387"
   ]
  },
  {
   "name": "sha256:cc9ee225fd1e0094dd73155ea1dae1da3abc0e136835ad844f98244948247246",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:cc9ee225fd1e0094dd73155ea1dae1da3abc0e136835ad844f98244948247246",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:ac3143d6092da265fe38fcde94e5aa790146bc14fc0580c8093e76bac041cda5",
    "sha256:daafde1802a6994c387b4d0073ed6a97993dd356fffcf125737638c7dcee8c95",
    "sha256:6ba3d67fd04fec610118bcfce997805f5f9797bc8a15818cbf6457009080b6c5"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:9e2380c42a6c00fe2cced9baadb71d3dcb78ec0e64034203033b3c1d7d82b233",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:9e2380c42a6c00fe2cced9baadb71d3dcb78ec0e64034203033b3c1d7d82b233",
   "tagSymlink": "5257ebbe",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:629f6067d450d2e8ccf93197d5bf44a10a5501adfe934ed6f4bd1643354e6496",
    "sha256:66f5feaa037fbb0a3bb47ddccd775c591d9070fca3750deca74bf058a7889499",
    "sha256:cc9ee225fd1e0094dd73155ea1dae1da3abc0e136835ad844f98244948247246"
   ]
  },
  {
   "name": "sha256:629f6067d450d2e8ccf93197d5bf44a10a5501adfe934ed6f4bd1643354e6496",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:629f6067d450d2e8ccf93197d5bf44a10a5501adfe934ed6f4bd1643354e6496",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:3d4679d6550ed04bed8f137eccb2f5198efb4491950ec50f15831eda1b6ad963",
    "sha256:5546738feec5eb09935bf7014926e6bcb8049d73764d50dc11ae164f11deccb8",
    "sha256:c36f60027bd59ef6ce62ee866244da7c0a5cdd6d614836215a6ce23d8105fb20"
   ]
  },
  {
   "name": "sha256:66f5feaa037fbb0a3bb47ddccd775c591d9070fca3750deca74bf058a7889499",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:66f5feaa037fbb0a3bb47ddccd775c591d9070fca3750deca74bf058a7889499",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:abad6baafc4cb0a77e481dea4a8bc47a7ed5b5c944d494c18bfbec3aeba4e8cc",
    "sha256:f8b6518a01c5213dc4b985dee1a3ab5c102b8ae2f51ce1197ab9c2e2b3854ead",
    "sha256:47da4a42793c30b814cf65746745144995f03e92e5e744d0625f593eebd734c0"
   ]
  },
  {
   "name": "sha256:103c0819d23256bc5e7046410c43c94b03c7976738694feeb413f2c25b3b8f9f",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:103c0819d23256bc5e7046410c43c94b03c7976738694feeb413f2c25b3b8f9f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:65627708fc00242c21d206f20fb300b4842b3ecc95740fb8cf72b306dd31105d",
    "sha256:3ce43719c1237d93898319e06c63ff8447dc24be4b9ba8c0004a2a3672692dbb"
   ]
  },
  {
   "name": "sha256:4ae3eb20b4c710033d667e4fdae5f9750f8e03d62bf4626225e02611375eddd5",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:4ae3eb20b4c710033d667e4fdae5f9750f8e03d62bf4626225e02611375eddd5",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:6246994597dd390eef367fb32568439866cdf1443f55ee6910cfa7ccebaaf5e8",
    "sha256:1108b9c7dabe3552ef871302b223e490de4184ccddf782efe669a231c957c54d"
   ]
  },
  {
   "name": "sha256:226572d567c1ec07965b1295d99c132537f42fe71214eb79b54481f55b0926a8",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:226572d567c1ec07965b1295d99c132537f42fe71214eb79b54481f55b0926a8",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:6cbab348a5013af518ab4e3968b3bdebe05987b9ef2de75ff2a7d37aae734752",
    "sha256:7d2e8e380cacc6f04c0abeb116edc447914fbf77f7795f9ac629d71c0309a01d"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:f017b85cd6469eca2c95b9a695ccf424de49d5807dd25143fd9f1255506c00a8",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:f017b85cd6469eca2c95b9a695ccf424de49d5807dd25143fd9f1255506c00a8",
   "tagSymlink": "47f573c7",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:103c0819d23256bc5e7046410c43c94b03c7976738694feeb413f2c25b3b8f9f",
    "sha256:4ae3eb20b4c710033d667e4fdae5f9750f8e03d62bf4626225e02611375eddd5",
    "sha256:226572d567c1ec07965b1295d99c132537f42fe71214eb79b54481f55b0926a8"
   ]
  },
  {
   "name": "sha256:d9332ec67415a78d38ee60b7d15c63475693590160caeb461767683b0dd21751",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:d9332ec67415a78d38ee60b7d15c63475693590160caeb461767683b0dd21751",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:bdee7855ef43f1c1d40221634c315c1998e5ee6f976d77dec4834f669bee371d",
    "sha256:df8985aa78d66ad0ca1e65cdf78c0a770212de626074c34770d25b8dcfc5e4bf",
    "sha256:39c96b7da7b0c1818df47df00d87d5171728b549d138f21307892de8f0001d33",
    "sha256:ebec2dcaa00a7b82e98583fd23b8b68da1804778e6b09f7356d61159dbc3804a"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:bb839a801a703a0b6850e7af8948a9546a8fc75822a88266a31c40874834cdb3",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:bb839a801a703a0b6850e7af8948a9546a8fc75822a88266a31c40874834cdb3",
   "tagSymlink": "73982f5e",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:3a6619c418c74824b6a69dfce26f2070aae8b7d56b7cea756ab68d5e2c459e07",
    "sha256:09a8a3da7024fbd081caff8cd62c67c898beade0597ff0656d0994daa08b4166",
    "sha256:d9332ec67415a78d38ee60b7d15c63475693590160caeb461767683b0dd21751"
   ]
  },
  {
   "name": "sha256:3a6619c418c74824b6a69dfce26f2070aae8b7d56b7cea756ab68d5e2c459e07",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:3a6619c418c74824b6a69dfce26f2070aae8b7d56b7cea756ab68d5e2c459e07",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3de00bb8554b2c35c89412d5336f1fa469afc7b0160045dd08758d92c8a6b064",
    "sha256:c530010fb61c513e7f06fa29484418fabf62924fc80cc8183ab671a3ce461a8e",
    "sha256:3d0fae63674bbf4ba99b8c5007fdba43df42df5fd138393a652d4b190350940b",
    "sha256:1273b18d811f5f88e065a9ed395156d0da7c616efd63a17304b09bb3e276814c"
   ]
  },
  {
   "name": "sha256:09a8a3da7024fbd081caff8cd62c67c898beade0597ff0656d0994daa08b4166",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:09a8a3da7024fbd081caff8cd62c67c898beade0597ff0656d0994daa08b4166",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:2cbc2866f0e2741aa3c72c6a699db0f8b25a5a5fea7d49ee2aa4f9a97ec6ee4c",
    "sha256:17e3a5f768e10e019b5bf765f63f8f9243bdfc7856b6c5b92b2b93430a7a91e7",
    "sha256:fdddffd289dea2c1f43bef5e034d9ac6ba587fa343ba808469b913b01598e5b6",
    "sha256:b75f4bf01bbe8ad5e797b4cbceccc401ea3e9eb4c1c0a6388fa3c01d5cfac386"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:af1e3b76a959bc9570f7347fa1515045e7f7a81ee025e45d0afeff2b3532ae18",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:af1e3b76a959bc9570f7347fa1515045e7f7a81ee025e45d0afeff2b3532ae18",
   "tagSymlink": "eab45936",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:e5bb9d16b247158c4a5d93cb6ceb446c17d030cf20c5f1b62e57b119c676ca7b",
    "sha256:06e4f3982d520f57ac362ba6ca551f79fb310df96dc7053d5c616e53306eb043",
    "sha256:d679eb84fb52b74491e370cbfbeda5b5982fccc3f5e77038dd850e9ce0dc04a9"
   ]
  },
  {
   "name": "sha256:e5bb9d16b247158c4a5d93cb6ceb446c17d030cf20c5f1b62e57b119c676ca7b",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:e5bb9d16b247158c4a5d93cb6ceb446c17d030cf20c5f1b62e57b119c676ca7b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:450cad02d0d66b492658a5ddb98d575ebef5ed97205f2239e0486686eddf55b5",
    "sha256:da15705755806d939ec3b5d51514579df1950857c14d886f1717c0a3b8b568dc"
   ]
  },
  {
   "name": "sha256:06e4f3982d520f57ac362ba6ca551f79fb310df96dc7053d5c616e53306eb043",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:06e4f3982d520f57ac362ba6ca551f79fb310df96dc7053d5c616e53306eb043",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:0cc66b0aae8017087ac213a7c21346695ceb29e42180f60be8a14d023e397785",
    "sha256:36e6f843028650ab26b7ff3f16c47c5d6a6d437a5615bbdc6bcc6613a86ec252"
   ]
  },
  {
   "name": "sha256:d679eb84fb52b74491e370cbfbeda5b5982fccc3f5e77038dd850e9ce0dc04a9",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:d679eb84fb52b74491e370cbfbeda5b5982fccc3f5e77038dd850e9ce0dc04a9",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:a03aaa33ce481b181671abdeb1aabf7f988f3f541afec7d59138ecbdc75dc50f",
    "sha256:0d65f5cb2f54ab0ff4b05aa9134c33f9316818128ca61a1daae125ccc1edfb21"
   ]
  },
  {
   "name": "sha256:8b92fc40d0cf1bdc724405cf59506594b372bc581522f182f003837f00944822",
   "path": "openshift4/ose-local-storage-operator",
   "id": "sha256:8b92fc40d0cf1bdc724405cf59506594b372bc581522f182f003837f00944822",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
    "sha256:39504606388e1d44d94d8a1b2d37e37c80a5453590aaa0ec5b1c8b510a77750f",
    "sha256:fc1398c595b1941a8f4f27bd9a3bee7c14a5a4c0d4bb8363f8830e65aa683823",
    "sha256:dce84c3836d8694a5c495a4d968bb4607a7b2aafb88edd3f9cc8ab51f0b85c27"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-local-storage-operator@sha256:0749bc8c664e19a530ff2b006ffba1d14143a8bab905900e62b0a0d4b3733e91",
   "path": "openshift4/ose-local-storage-operator",
   "id": "sha256:0749bc8c664e19a530ff2b006ffba1d14143a8bab905900e62b0a0d4b3733e91",
   "tagSymlink": "e70aa966",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:c160a382ef65dddb7e2e0776e43893554fc7d3522786a59640642e82091194c3",
    "sha256:806e00ea5b6890eab65ea5baab7bc64ef0431d8c6f1b28535af8b6404fe0d53a",
    "sha256:80eae6a007faf45c5fa7150dd7dbd7b1b9b2e3b4dd69ccece725a405612a4f49",
    "sha256:8b92fc40d0cf1bdc724405cf59506594b372bc581522f182f003837f00944822"
   ]
  },
  {
   "name": "sha256:c160a382ef65dddb7e2e0776e43893554fc7d3522786a59640642e82091194c3",
   "path": "openshift4/ose-local-storage-operator",
   "id": "sha256:c160a382ef65dddb7e2e0776e43893554fc7d3522786a59640642e82091194c3",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
    "sha256:b56af1360c83e0a0479bf161b3ec392c8c513f8e8104700c8ed696fe4b261c8d",
    "sha256:0afa4339d0d778869bcd926ca5991081026a17ab7084316c1259be80cc02c056",
    "sha256:1e80b8df630e74c8144c56a29443f59a5b3f66e9d1c32e2f6a6ff401bad945e3"
   ]
  },
  {
   "name": "sha256:806e00ea5b6890eab65ea5baab7bc64ef0431d8c6f1b28535af8b6404fe0d53a",
   "path": "openshift4/ose-local-storage-operator",
   "id": "sha256:806e00ea5b6890eab65ea5baab7bc64ef0431d8c6f1b28535af8b6404fe0d53a",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
    "sha256:74f1fb7a06eab765809ca437e035b054dcfb1e6ecb3158ecc8a9076b6f26210f",
    "sha256:3b2af82f9a2465d6df678ac59f38b86933f9aeacfd702228ad9e15f3a0dcec56",
    "sha256:8b488ead50c6cea7fcdb5a4bbb20acd2a9fb3c5e3072c7da06f0435411a136f2"
   ]
  },
  {
   "name": "sha256:80eae6a007faf45c5fa7150dd7dbd7b1b9b2e3b4dd69ccece725a405612a4f49",
   "path": "openshift4/ose-local-storage-operator",
   "id": "sha256:80eae6a007faf45c5fa7150dd7dbd7b1b9b2e3b4dd69ccece725a405612a4f49",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
    "sha256:9510f581bc6968bd3717fd248986be74458e606ee275a794d769df8d1e544640",
    "sha256:9793d8d74c1da1aafbe78bd188429786077c545daf12c140dc0ecd8c54abad0d",
    "sha256:0f1e8a759bc3b1f1c29c3c26fbfd5a6df14a6a21d5742ce790433f6572b3b581"
   ]
  },
  {
   "name": "sha256:3b3d0401dec6c7e1710b8e4a8c29a88a9bef1ed318bf570db1f344f5d31b3cbc",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:3b3d0401dec6c7e1710b8e4a8c29a88a9bef1ed318bf570db1f344f5d31b3cbc",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
    "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
    "sha256:1a51fdc4dea0890ac86174af981ae0b06dd72b81a5ee9135c1c3db1e75776e86",
    "sha256:4ab735bee8233bdc36f03a3a688bbad3b0abbfd37adb02aa10cc59d8c794d63e"
   ]
  },
  {
   "name": "sha256:735ab4c8b1061dc6cc97fe54a2e21abf5f5f7e643f9ae6155845e68bf96a401b",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:735ab4c8b1061dc6cc97fe54a2e21abf5f5f7e643f9ae6155845e68bf96a401b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
    "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
    "sha256:2cc5e8062db81de6483c7a412cc24b322d6003255a5ee5b70ab514c055ec88d9",
    "sha256:fabb4ea5b6a06984d775022732f828747b8f7a642b9e705bc23510e046d3c3b8"
   ]
  },
  {
   "name": "sha256:fbe5cf3be8cc23d1d994e62d5ab08face3de033f1838b2fb07599631c7df1c8b",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:fbe5cf3be8cc23d1d994e62d5ab08face3de033f1838b2fb07599631c7df1c8b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
    "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
    "sha256:fb9f760c9a9cdd2c1bf696352f6e638fc7408b212db849616c0f1fb9be6dde6d",
    "sha256:f6e8be2377b6333288e8500266307fc9984d451561b54e71dc6a4f0f5865aae4"
   ]
  },
  {
   "name": "sha256:02ded9f847070a0e89d7e448fe8fe195a8077f714c6bdb56394f840c7f280000",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:02ded9f847070a0e89d7e448fe8fe195a8077f714c6bdb56394f840c7f280000",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
    "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
    "sha256:2047a773b1dde72990f99c1fc10f8cc4eb3c86bf6a0d00e4f91be0d453de2f2e",
    "sha256:030f78b21570298816f9d337d9b88832a46944bee62847d09e07ecb60ca20cc0"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:8503a9bab5ea92bc6f7f8cdc00b4dab8e73103973d17b0bfdbf921d15cd9a4c0",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:8503a9bab5ea92bc6f7f8cdc00b4dab8e73103973d17b0bfdbf921d15cd9a4c0",
   "tagSymlink": "519fb1b6",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:3b3d0401dec6c7e1710b8e4a8c29a88a9bef1ed318bf570db1f344f5d31b3cbc",
    "sha256:735ab4c8b1061dc6cc97fe54a2e21abf5f5f7e643f9ae6155845e68bf96a401b",
    "sha256:fbe5cf3be8cc23d1d994e62d5ab08face3de033f1838b2fb07599631c7df1c8b",
    "sha256:02ded9f847070a0e89d7e448fe8fe195a8077f714c6bdb56394f840c7f280000"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:a640d9395a7dad7c5d2306af3ba60a3430358e705b647ebf272e38e27282ad4c",
   "path": "odf4/ocs-operator-bundle",
   "id": "sha256:a640d9395a7dad7c5d2306af3ba60a3430358e705b647ebf272e38e27282ad4c",
   "tagSymlink": "a69a5893",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:7732372f758045fbfc1d5c9bb2902e018bfa53c62797156e6022a1944d7ac9f8",
    "sha256:9edd7a574d1cd05c6f5b357104c668f75cdfbae5443e62e9de1fc6cf735988d6"
   ]
  },
  {
   "name": "sha256:da5b291e453a4a25d4ad8ad079dcedf5cde8e91b253034fec226fb6e935fcd13",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:da5b291e453a4a25d4ad8ad079dcedf5cde8e91b253034fec226fb6e935fcd13",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
    "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
    "sha256:924112c2904f81fb942f2784f9e4630b97826ca95e984756b553350bc2abd613",
    "sha256:68275358d02dfec82067228a78975841970b40b3fb3a10bbe5985aa0865cebb1"
   ]
  },
  {
   "name": "sha256:ab39376e9dc15cb2223bfbaf286d23dd6455420dc9808578dc62a57fb2395cbb",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:ab39376e9dc15cb2223bfbaf286d23dd6455420dc9808578dc62a57fb2395cbb",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
    "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
    "sha256:47885edc5104636172fa5dde611aaa39c2a4277e5a740c959ea6bd8d731efaff",
    "sha256:0c8db35d43dd3f169f26cf4bfd2dcf7616a04b19683c91b41017d4553968e689"
   ]
  },
  {
   "name": "sha256:2f6409e1ab97cc65027f0f5a1cf90941c2274faba2693735f88259a1afea1751",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:2f6409e1ab97cc65027f0f5a1cf90941c2274faba2693735f88259a1afea1751",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
    "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
    "sha256:4c8a2ab2d39b895c6dfafca42e978a9fc9daeeceffbb721ee9c2b33cafa1fd08",
    "sha256:3f716573f90c656f0a042273957678a1adfab55ce31337c9257a6b251907d107"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:84a562d0337bbac13c098bee7eb29f383d2e1b019b2d8fc823e68b19ce41be60",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:84a562d0337bbac13c098bee7eb29f383d2e1b019b2d8fc823e68b19ce41be60",
   "tagSymlink": "b6eac787",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:da5b291e453a4a25d4ad8ad079dcedf5cde8e91b253034fec226fb6e935fcd13",
    "sha256:ab39376e9dc15cb2223bfbaf286d23dd6455420dc9808578dc62a57fb2395cbb",
    "sha256:2f6409e1ab97cc65027f0f5a1cf90941c2274faba2693735f88259a1afea1751"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:dc4d9a53dea5573e3020ad5d1ea1018705b6be25294c722d29f57bd90564c58c",
   "path": "odf4/odf-operator-bundle",
   "id": "sha256:dc4d9a53dea5573e3020ad5d1ea1018705b6be25294c722d29f57bd90564c58c",
   "tagSymlink": "8e911a44",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:9b0c130e0a69189b65ff5390aa02a77956b45b0225966c6e6e81ea84bbc65abc",
    "sha256:4d29eb73ff6c64274a7952b924d6af3c4498fe28e3e9543e46b6d1ba85c925ad"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-rhel8-operator@sha256:83b24d46f98858fd9d7a7545f4e1b0bdd810b3e4c615ec6f8d46a51bf5ab003a",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:83b24d46f98858fd9d7a7545f4e1b0bdd810b3e4c615ec6f8d46a51bf5ab003a",
   "tagSymlink": "dd284910",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:82d7fb62915688a32d3828cf1cd37849e3423c10e9266a4b3ab023167ffcc8c3",
    "sha256:bcb4b67588a5c922be7a50814b640b6284a0a546b193bfc57f7e3e814ab37872",
    "sha256:7c2a9e94cd13643b156316d5068e521f106b315ff8361b3fca21d84a3476934e"
   ]
  },
  {
   "name": "sha256:82d7fb62915688a32d3828cf1cd37849e3423c10e9266a4b3ab023167ffcc8c3",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:82d7fb62915688a32d3828cf1cd37849e3423c10e9266a4b3ab023167ffcc8c3",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
    "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
    "sha256:dee10834884ded7d21b6f6e4d591ff4d47d42be4f98c19887703938bc8171ac1",
    "sha256:563599c23ff3876dc641b0af00b428072ed519178d3b133679c76d18d8e7233b"
   ]
  },
  {
   "name": "sha256:bcb4b67588a5c922be7a50814b640b6284a0a546b193bfc57f7e3e814ab37872",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:bcb4b67588a5c922be7a50814b640b6284a0a546b193bfc57f7e3e814ab37872",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
    "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
    "sha256:063b793e626151664cfda0e4f13be084fda911e98a5413e03e93e42cba1567a0",
    "sha256:5fce155794cea8fc14ac25e5d8b7e3375da2aa83099523d3da91750f072a6c68"
   ]
  },
  {
   "name": "sha256:7c2a9e94cd13643b156316d5068e521f106b315ff8361b3fca21d84a3476934e",
   "path": "odf4/odf-csi-addons-rhel8-operator",
   "id": "sha256:7c2a9e94cd13643b156316d5068e521f106b315ff8361b3fca21d84a3476934e",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
    "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
    "sha256:620cc9f36a9fcff0621b3719f1f795e60ea38de7c35579d0eb2d8a0c290a80f7",
    "sha256:b7f5109279cec62eb4193b7d7770c13e8edac1c3ea37ac8ef3fbe4e655cd5fbf"
   ]
  },
  {
   "name": "sha256:cd6c27bd6aa0b13fac3f10f4002940f4df7ee43abcacfc5235bee31d0eecf391",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:cd6c27bd6aa0b13fac3f10f4002940f4df7ee43abcacfc5235bee31d0eecf391",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0a21bb5475ea5fbcfdeab2bbe08a1cf4ef0b55382d553d2c213620763078223c",
    "sha256:38dd71adcfc1f964c6f3ba6ae3b6daa95f612681cfb05298b225bb6347942f56",
    "sha256:ea3cc532485d33cde86334ac280e39af74db84044aa10d44ebb83b8322a9aa8b",
    "sha256:7407b3e1760a358f888f414c169426c852b96ab839559f634ad4c682125ae475"
   ]
  },
  {
   "name": "sha256:c61b935f9d32eff217953e3d5d1e61416830c679cd6486f525ecd60ab8fcb631",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:c61b935f9d32eff217953e3d5d1e61416830c679cd6486f525ecd60ab8fcb631",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3abc8c0d3d4265b5efb17447cd4a399fc70858b08d7cd5dce88dca7a09bc089",
    "sha256:ada7e11fb107d011a3b016cc659ca3f138f11725949328d92d3714ac15ef4ce2",
    "sha256:ae30dac98739aae4aaea001188a0a315b0781f64ac79c23d4cf9bc89485df5d7",
    "sha256:8bc77ee07a89d70808e193a86cf5d506c77350a9ab6d232b36e2071b3a363c5b"
   ]
  },
  {
   "name": "sha256:68a8c03c7db768e1992b2d92b661f9d30604d7db6d51e0a15b4560f1e80c5402",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:68a8c03c7db768e1992b2d92b661f9d30604d7db6d51e0a15b4560f1e80c5402",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92559d5f5a908101d2776f8e756d73806b2bd3354be51e12d3111c90a4f09b07",
    "sha256:083e3eac55c875258c6477c979a400f62751e489a5aa9ffbbf0bf0bfdf773bcf",
    "sha256:e0a52ce59f7192f89c2cbe76854508a23c17fbe4abc14b95dd35a3e4d72e2d01",
    "sha256:853713a4b8af5fc97fd49da08aacd56f8d8ec9ed580ce1e7afe5c91c7386ed20"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:83fa1802f532c4c17aebe2fecdc4a49a6308efa12b1e03c62c527ae5a8ce261d",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:83fa1802f532c4c17aebe2fecdc4a49a6308efa12b1e03c62c527ae5a8ce261d",
   "tagSymlink": "6bcbcdb3",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:cd6c27bd6aa0b13fac3f10f4002940f4df7ee43abcacfc5235bee31d0eecf391",
    "sha256:c61b935f9d32eff217953e3d5d1e61416830c679cd6486f525ecd60ab8fcb631",
    "sha256:68a8c03c7db768e1992b2d92b661f9d30604d7db6d51e0a15b4560f1e80c5402"
   ]
  },
  {
   "name": "sha256:b290cb25e6e7417b120a4e19076a778ebd78c3ac5a657661dddbe2c280bd2769",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:b290cb25e6e7417b120a4e19076a778ebd78c3ac5a657661dddbe2c280bd2769",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d3b9a4a690bf1791b874c3495c6a8e2c039150b5882374cd9c42dd4bba68ba31",
    "sha256:a049ed70eeb87542c711449e14b6a7ccdde9ca2219d749fa0872aa755f2a89cb",
    "sha256:ed7ab2c89f7ad45e66ee453768e145ebb588b5a24b023c88cad737f2361e939f",
    "sha256:fcb00df42aef515369a37ab196cc361f2087449e40370eca401b32830e58de8c"
   ]
  },
  {
   "name": "sha256:bea3cd63c0d9a5f4f99e84714d4a374b51d0f3d27182e61cbf823584c2be7005",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:bea3cd63c0d9a5f4f99e84714d4a374b51d0f3d27182e61cbf823584c2be7005",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:02863a09124c1837ee0672a011fb7e2d5c95ae16af6b569f65d2e0f763127ddc",
    "sha256:97aead8e17dadf7e07e5153ee6d5a68d28e46847e01db6d9325742076043fd20",
    "sha256:da210814b21e3bbffc7570450e9713d7bf61a9d7caf5bebf5076314ade3900f3",
    "sha256:4b476ef09e348095f3a50bc4eb4d38a4d96e6ad4eebe25d9d33379f854d0674a"
   ]
  },
  {
   "name": "sha256:cbb119731f1173a3701112130824fe64650ebc2199fa442a1317e1fe4a712ef4",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:cbb119731f1173a3701112130824fe64650ebc2199fa442a1317e1fe4a712ef4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:220d447748c8866cbfeac8fb3534dd8d49cc8b99cc625041414c17d0f80e02ca",
    "sha256:8909629d32e7d0fef085a5fcee0e0f318367006d81be0d5da8e0a209ee230793",
    "sha256:6478431628b255e922b03c9275e15f65fbf2c9ba3c1d7f8556f8c2eb4182bff3",
    "sha256:7ba332f1930df17b2feff4d82f31c624c0ba22a0dfe40e73ddb8a75ca0d9f40f"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:752fe3d8d6c48b640d482dd592282ca3fb4fbed8b7b3caac3d43ceb152bccf78",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:752fe3d8d6c48b640d482dd592282ca3fb4fbed8b7b3caac3d43ceb152bccf78",
   "tagSymlink": "45c179f2",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:b290cb25e6e7417b120a4e19076a778ebd78c3ac5a657661dddbe2c280bd2769",
    "sha256:bea3cd63c0d9a5f4f99e84714d4a374b51d0f3d27182e61cbf823584c2be7005",
    "sha256:cbb119731f1173a3701112130824fe64650ebc2199fa442a1317e1fe4a712ef4"
   ]
  },
  {
   "name": "sha256:4c5b0420eb7c918cee192e855b7f1109eb21b2b3de8c075e7978882c0fedeb14",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:4c5b0420eb7c918cee192e855b7f1109eb21b2b3de8c075e7978882c0fedeb14",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:fe15b86e6f05ef5a4f4e954163d7635699317ee382b33a14579fa4291440527d",
    "sha256:74f86d1a2ef479b624fd20cc45ba063a8d00e3899702864818b17977ada556ce"
   ]
  },
  {
   "name": "sha256:1c4240b765ef1785fff3cc4233ad1d9fcbb2da011b5bed64876720c553055bf8",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:1c4240b765ef1785fff3cc4233ad1d9fcbb2da011b5bed64876720c553055bf8",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:06ffebee5ba70f0d1a738e5e57b5b748b450d2a4bc0cc03af989e2ec9e195ecc",
    "sha256:00da6303ad18a72a18199b0c38376f5f423a4329325d9f5fe74f134e0a794150"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:179b50f0e2d2cd1ac9db869a67781610e8335424310983bb581487503c6b5498",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:179b50f0e2d2cd1ac9db869a67781610e8335424310983bb581487503c6b5498",
   "tagSymlink": "de3550ca",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:94c31108dbcd90042f119fdc8a4f6ed33f01e5d191cea093fa938d7efd199fbb",
    "sha256:4c5b0420eb7c918cee192e855b7f1109eb21b2b3de8c075e7978882c0fedeb14",
    "sha256:1c4240b765ef1785fff3cc4233ad1d9fcbb2da011b5bed64876720c553055bf8"
   ]
  },
  {
   "name": "sha256:94c31108dbcd90042f119fdc8a4f6ed33f01e5d191cea093fa938d7efd199fbb",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:94c31108dbcd90042f119fdc8a4f6ed33f01e5d191cea093fa938d7efd199fbb",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:002c9820deb5c42560208ec3c0f2ff43b27346a7aca2786bc2763620a290391d",
    "sha256:6bdea5fff32dbb7dd7466503a6f288b035042996dce6f58c410530ab58e8cf50"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:28161864968ee4dc66ed6600697c469c714538cf27c66a2096e4443a6eef52b4",
   "path": "odf4/ocs-operator-bundle",
   "id": "sha256:28161864968ee4dc66ed6600697c469c714538cf27c66a2096e4443a6eef52b4",
   "tagSymlink": "2084f3fc",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:c851fdb05276a6cc20324758208cfe0683e3c8c6a6641fd6cb2ca6d116b0bc0e",
    "sha256:425a9a93735df8980a8e989e93b87602e4d0bade3b3cc578e90067b8b3a66e84"
   ]
  },
  {
   "name": "sha256:cf3288eba18c7ccb414d1de199167f02b65eaafcfec317385a2732863139c4ed",
   "path": "openshift4/metallb-rhel8-operator",
   "id": "sha256:cf3288eba18c7ccb414d1de199167f02b65eaafcfec317385a2732863139c4ed",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
    "sha256:e37a81a9ad13c7b79c0766bf92762a161852627fa24f74b189b3ef5ad8f8e2e0",
    "sha256:7eff185d5f9109108d5ad700998bb5eab383e75d39fc0d0fc5daafe41460e639"
   ]
  },
  {
   "name": "sha256:7dc831bdb6b1e7acfea4647455bcc1916a7139bc86e7e0c882765cacd1640e6d",
   "path": "openshift4/metallb-rhel8-operator",
   "id": "sha256:7dc831bdb6b1e7acfea4647455bcc1916a7139bc86e7e0c882765cacd1640e6d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
    "sha256:e0aede7a39b077a043c4afe328adc38cd46676df60f111bca16ea81de49c350a",
    "sha256:3a99e0036d0e71dcf887b00a3f3abbfb876613dba8dc1ed57e6bafcf5510c9c6"
   ]
  },
  {
   "name": "sha256:72dfdf2bace595308dfeff25e20f9de32793b2b8facb62699e16dc2740d36310",
   "path": "openshift4/metallb-rhel8-operator",
   "id": "sha256:72dfdf2bace595308dfeff25e20f9de32793b2b8facb62699e16dc2740d36310",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
    "sha256:b67bd9d1a77b8b682a53f693c686c973a5327b4d6382f9517384508ab322302f",
    "sha256:187bdfdcbb098bc9f88782b1de9e547ae55532eea363fc9cb6a05134be2f57f1"
   ]
  },
  {
   "name": "sha256:eada77e33decfbae781518352f8ec742950dec65daafcad1171e29c6e69087ee",
   "path": "openshift4/metallb-rhel8-operator",
   "id": "sha256:eada77e33decfbae781518352f8ec742950dec65daafcad1171e29c6e69087ee",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
    "sha256:47587ce7e2e16b65094c279910d7c665204abeebaa177d00780732d5449d2dd1",
    "sha256:e49b44504fc1fe4f5ccf4c33b23dc47579c8b9f3098264b11c552ed4b9ca183c"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/metallb-rhel8-operator@sha256:772f41acc4cd467ad0e93db4bec2277754aa644d69849028a2fd50504fce4886",
   "path": "openshift4/metallb-rhel8-operator",
   "id": "sha256:772f41acc4cd467ad0e93db4bec2277754aa644d69849028a2fd50504fce4886",
   "tagSymlink": "18d6c080",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:cf3288eba18c7ccb414d1de199167f02b65eaafcfec317385a2732863139c4ed",
    "sha256:7dc831bdb6b1e7acfea4647455bcc1916a7139bc86e7e0c882765cacd1640e6d",
    "sha256:72dfdf2bace595308dfeff25e20f9de32793b2b8facb62699e16dc2740d36310",
    "sha256:eada77e33decfbae781518352f8ec742950dec65daafcad1171e29c6e69087ee"
   ]
  },
  {
   "name": "sha256:00508ea6e2c614cac6eb66893612f5f0961e3c329ef619ba7da844f04c20f376",
   "path": "rhel8/postgresql-12",
   "id": "sha256:00508ea6e2c614cac6eb66893612f5f0961e3c329ef619ba7da844f04c20f376",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:0c1fd83997e17b079085107d40f89cea2211f9ec3db88d5241019a85d06db5a7",
    "sha256:12bdc7db0443e8648516eddbfe0e15a24b4dc781bcf18620b4c9d1cca2c5407e",
    "sha256:ecf502c449196b5ac76f8ecdd27d81ba9fa67fba16cd3cc8ab1e14124a3cba77"
   ]
  },
  {
   "name": "sha256:50273c7b11d2d9bdd25b1b3a539420344919fde5fc1c6be137639b4920c00b4f",
   "path": "rhel8/postgresql-12",
   "id": "sha256:50273c7b11d2d9bdd25b1b3a539420344919fde5fc1c6be137639b4920c00b4f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0f6e46285dbeaad8b2b8f01b5fe21771fc2b522ceafaf88d8f51ff88b51d87a9",
    "sha256:b88304ccd20b48c3e167431fdaa53db68d449caf91511ca66a32b356f947b6ea",
    "sha256:65eddd4ebf48afabea25643c1557f7181013847b5a4f98063a03489130b65755",
    "sha256:5db2c5a8d728886088d558c377825e41ba67c08c1ac75d62771d616b0a93ae68",
    "sha256:bfe30eebb0fd23d95d8ae44d7f14a13fb9267e180a3b36363350330d7269d3d3"
   ]
  },
  {
   "name": "sha256:c3a512657f8194675992388a521b16bca9eeb6be0fad96a06522dda208415663",
   "path": "rhel8/postgresql-12",
   "id": "sha256:c3a512657f8194675992388a521b16bca9eeb6be0fad96a06522dda208415663",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:d2be686e74da7c701311c471acf80b269afb9a3165314de5aa2b9a6df6562fd7",
    "sha256:3b00a282b422a128c038b6edcded4919fb981eee39a10b119e56736e439aa3b5",
    "sha256:9f7ab4e60e6a1d63db4432620a66351874eab776df535e9d7d97b99cd40217f1"
   ]
  },
  {
   "name": "sha256:fc3fb6c8321e7d40e17304ebc0434ccf476197c0e389142853503939493a52ae",
   "path": "rhel8/postgresql-12",
   "id": "sha256:fc3fb6c8321e7d40e17304ebc0434ccf476197c0e389142853503939493a52ae",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:da6cf90000f1e8c68029513a3674919c4c460ed472ba88ccbaa046c74ddcc951",
    "sha256:de7ee2617b8a6627a55d3428614b8271e3ab61b790ef9405dcd072ea715793a6",
    "sha256:701a293416f0661fa32724dd9542418ed19f6b6817aab5963c95052b48e2a509"
   ]
  },
  {
   "name": "registry.redhat.io/rhel8/postgresql-12@sha256:fa920188f567e51d75aacd723f0964026e42ac060fed392036e8d4b3c7a8129f",
   "path": "rhel8/postgresql-12",
   "id": "sha256:fa920188f567e51d75aacd723f0964026e42ac060fed392036e8d4b3c7a8129f",
   "tagSymlink": "7a9d35ac",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:00508ea6e2c614cac6eb66893612f5f0961e3c329ef619ba7da844f04c20f376",
    "sha256:50273c7b11d2d9bdd25b1b3a539420344919fde5fc1c6be137639b4920c00b4f",
    "sha256:c3a512657f8194675992388a521b16bca9eeb6be0fad96a06522dda208415663",
    "sha256:fc3fb6c8321e7d40e17304ebc0434ccf476197c0e389142853503939493a52ae"
   ]
  },
  {
   "name": "sha256:d66256c5556046c1c13305032135cb557ba6f583bbffe4ee5abb8cea768b2ec2",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:d66256c5556046c1c13305032135cb557ba6f583bbffe4ee5abb8cea768b2ec2",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:9f78280d50082c329e73123d73b3debc7f5eec007d8a0c7b1d388ff69b9652fc",
    "sha256:a1a64b9c0d1a2a468c65bf81fb26d51416a3e19d95d08df39e5d7d012a25b685",
    "sha256:f7109c3dbacb07ae738be8afb80c1d580757c61c03ec5e18ef2fa600b7823d26",
    "sha256:40ebdf21c7df4bc66e2fa9aff0f89bcd301f0d7187a9002c2fabfd2b08d4b936",
    "sha256:2d2ba384b765dbbb0756687e5aa24db4c4c5e842db4c9d8098f5a09a605d2d79"
   ]
  },
  {
   "name": "sha256:484cc3f968a76c3cb876ceb530317c11dc93048c6ba4f1f5ae1d088131ed7cfd",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:484cc3f968a76c3cb876ceb530317c11dc93048c6ba4f1f5ae1d088131ed7cfd",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4f639942cb5a04cfde9e90ad4590927d87ec970f46186ebe46182c2f0657584d",
    "sha256:261c17695cc21090e4719a05e282f024f0ab9a36997b3e3550ee7a97dee98668",
    "sha256:aa345f2f6695ebc5e00997e8487c157fd9669cc8cfcb7dfabe3b00bb7ae5a4f4",
    "sha256:4d3642dc61ab84d825e0dc1a106398683a20f88f109ed1268a3df1254481c4db",
    "sha256:acd5b99027dfc7b89405d61ea8942495603aed0a3985b8a51377e900b73255af"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:dfe11ebccdc711a0b303d78c93998dac5fa41e8946beb7536b8a5e42c6d9ad05",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:dfe11ebccdc711a0b303d78c93998dac5fa41e8946beb7536b8a5e42c6d9ad05",
   "tagSymlink": "607290c",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:49c29686dd52cb83bef501080a5f4a3aca083f39779b6edde5fc904c1ddbeeab",
    "sha256:d66256c5556046c1c13305032135cb557ba6f583bbffe4ee5abb8cea768b2ec2",
    "sha256:484cc3f968a76c3cb876ceb530317c11dc93048c6ba4f1f5ae1d088131ed7cfd"
   ]
  },
  {
   "name": "sha256:49c29686dd52cb83bef501080a5f4a3aca083f39779b6edde5fc904c1ddbeeab",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:49c29686dd52cb83bef501080a5f4a3aca083f39779b6edde5fc904c1ddbeeab",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:1b890c73c3cf60b04334fded9e3edc647d64dd39ffd078317e2bd69552a2fd1d",
    "sha256:de63ba066b7c0c23e2434efebcda7800d50d60f33803af9c500f75a69fb76ffa",
    "sha256:b2a723a1165850255e84a64214f06e6adb9ff3f3290e0b35132313684af7b621",
    "sha256:927e99d68d749f9e40b07e4cfb68839ff8d3124c7464a2fe860c254142d66208",
    "sha256:c02ba9b8068d37b6b9b6db8d1883238f3ee8b0bf87a0ac271d0963b65edd33dd"
   ]
  },
  {
   "name": "sha256:3bc56e5f54ca3c4fb602f189bb215e23fc2f8d8c8d8a9471aa7dd80fa3b589b8",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:3bc56e5f54ca3c4fb602f189bb215e23fc2f8d8c8d8a9471aa7dd80fa3b589b8",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
    "sha256:b56af1360c83e0a0479bf161b3ec392c8c513f8e8104700c8ed696fe4b261c8d",
    "sha256:baa2b02f458888a9ce370968887299f96f8687ffe7fe9784360f8d5231ef60dc",
    "sha256:b0eb8d3033872241913cc97cb4ef9e9b8e52e3584b8c3a3dfbc38332f17501aa"
   ]
  },
  {
   "name": "sha256:ad28823be3f64dc5a8ebee74398d32c091b2d803e97caf64ebf8e58c273beaf8",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:ad28823be3f64dc5a8ebee74398d32c091b2d803e97caf64ebf8e58c273beaf8",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
    "sha256:74f1fb7a06eab765809ca437e035b054dcfb1e6ecb3158ecc8a9076b6f26210f",
    "sha256:a582bcdda8138937d47aac899fc6a963eed49529006be12dd401bd91a4ef9db1",
    "sha256:31216a6baeea34467944d7a09ad27c58aec23d87058bd0f69aa73d0bf3a2eb2a"
   ]
  },
  {
   "name": "sha256:4b9a7ac6918fee220b636bdde3e72865070a237ed5a213b5e8f379e598f03335",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:4b9a7ac6918fee220b636bdde3e72865070a237ed5a213b5e8f379e598f03335",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
    "sha256:9510f581bc6968bd3717fd248986be74458e606ee275a794d769df8d1e544640",
    "sha256:81edae57b824e905e551c3ae21dca3d1d92e7539ccd0f434d51441fd8743feec",
    "sha256:2b39c5e34be2a2e6fed20467851d869e47fd0568388ae5672729743cf2d94dac"
   ]
  },
  {
   "name": "sha256:59fd3f133a215e5033f1b2a9374be64534f8990e4b9ca13c6040b386febd5ed9",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:59fd3f133a215e5033f1b2a9374be64534f8990e4b9ca13c6040b386febd5ed9",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
    "sha256:39504606388e1d44d94d8a1b2d37e37c80a5453590aaa0ec5b1c8b510a77750f",
    "sha256:64271a6a4a100cb6a2922a4f2c32a04e258f4a47d423ce0079bf472f9208153d",
    "sha256:bb2450aeb475cae7b001b234d04c71f5b6523d2f6e96edd9a957101c9e343565"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-kube-rbac-proxy@sha256:a60cbabfba11788c7870ff050f7cb7fea8edfc9128c14e3fbe3056aa9bf68eed",
   "path": "openshift4/ose-kube-rbac-proxy",
   "id": "sha256:a60cbabfba11788c7870ff050f7cb7fea8edfc9128c14e3fbe3056aa9bf68eed",
   "tagSymlink": "7d54c882",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:3bc56e5f54ca3c4fb602f189bb215e23fc2f8d8c8d8a9471aa7dd80fa3b589b8",
    "sha256:ad28823be3f64dc5a8ebee74398d32c091b2d803e97caf64ebf8e58c273beaf8",
    "sha256:4b9a7ac6918fee220b636bdde3e72865070a237ed5a213b5e8f379e598f03335",
    "sha256:59fd3f133a215e5033f1b2a9374be64534f8990e4b9ca13c6040b386febd5ed9"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:42c85dd18d7da2286a9a07602cf18abe578a93fa6ce4feeaffed1bbbdcbfa3de",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:42c85dd18d7da2286a9a07602cf18abe578a93fa6ce4feeaffed1bbbdcbfa3de",
   "tagSymlink": "bf1917f5",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:6745d0dc7aa04e1635293fc74237a791ff0f55714c3400e4861b6137dce1ff10",
    "sha256:e0e828550c962af6769eb1a4956aece0091791992b87a5f89cddaefdb4297529",
    "sha256:64d53c4049a60c7fc56241e7c7498ac7e17d7463a62a03580fa3580920f9acbe"
   ]
  },
  {
   "name": "sha256:6745d0dc7aa04e1635293fc74237a791ff0f55714c3400e4861b6137dce1ff10",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:6745d0dc7aa04e1635293fc74237a791ff0f55714c3400e4861b6137dce1ff10",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:de4a1abf36a7aed82a349e791ad1249e0ff745680b92745c1e36d5ccecfe85cc",
    "sha256:e2e64ba5948c8fa2b9b67ec8fa375b6d8116617c497d2522f4afa63c9baa1d51"
   ]
  },
  {
   "name": "sha256:e0e828550c962af6769eb1a4956aece0091791992b87a5f89cddaefdb4297529",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:e0e828550c962af6769eb1a4956aece0091791992b87a5f89cddaefdb4297529",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:638e3d8b77f230d36759b82d44224b48862769e190246e072cbdae02c2e1017c",
    "sha256:0d9a0a8546468e7960464a85294ead7ebe830eb7bf6d3953461658bf53fe9a97"
   ]
  },
  {
   "name": "sha256:64d53c4049a60c7fc56241e7c7498ac7e17d7463a62a03580fa3580920f9acbe",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:64d53c4049a60c7fc56241e7c7498ac7e17d7463a62a03580fa3580920f9acbe",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:4043050bce8b2d6845d656dcb32574c51a70db583f2f2946576320586aa0a6af",
    "sha256:ce67e5b85cbbc5f09a023d1dd543a5197fb20ca62b0e6d5e34f3c7182f269a61"
   ]
  },
  {
   "name": "sha256:2c3a707f2634be16582aa3e66663ed47d44147620cc5c2ee25f0c60aa2a8e3f8",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:2c3a707f2634be16582aa3e66663ed47d44147620cc5c2ee25f0c60aa2a8e3f8",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:399eb2b7226e96b12325f0470a572b98e868286c4e7568f7623d863ae36fbe02",
    "sha256:65433b15516432f60f7099880a817b2573f45c98b31a8db77afaa31131870bb8",
    "sha256:d57d43cd9eea3773cbcf20561df915128a3b3d39d4ecc4642dcceb44d01cbe6f",
    "sha256:9f75a06011de4915beb37861c8fbdaf713e1c346e544fd1ebd7f4c284b2f68bb"
   ]
  },
  {
   "name": "sha256:469c9af9ee4cd125d8d30328bef5f962c243c143fba7715564f1bb2078d5ceca",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:469c9af9ee4cd125d8d30328bef5f962c243c143fba7715564f1bb2078d5ceca",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:af5458290b9eb5772f0935e6dca7d35a4b75ec3a8117aa664029b0c4cce4f51e",
    "sha256:f420bcd3aab1588a94555413993a363e00f450b2e22c5588b66aa86f2deef949",
    "sha256:925a9243259e1e369b9b0bf23949aad4c8cd2d79ae503bc8819acc42f8ebeae6",
    "sha256:a9ddeb96198e0639716aee4de67367640f4385d3968a0985b063d93fb854b0d0"
   ]
  },
  {
   "name": "sha256:8aa38717914b054cfcf2f0de1d6d6320d08fc828291e081c80a499c7708e2359",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:8aa38717914b054cfcf2f0de1d6d6320d08fc828291e081c80a499c7708e2359",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:633d8934e21d60dccb5c55df7a62f24f6ee0518f233c4b1948757a264269fb8a",
    "sha256:e1ca9215c6cc1a10f2973923cc30be793ac2087be96496e6d216e625341bcedf",
    "sha256:bd1019b57805ff5fb92b78b21e798fd26c1d00842483105d41fbab71f098bbb7",
    "sha256:8fe53d246eb2dfd59754492698afa72ac93379f467bc3f6762aa3b84569111f7"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:031c6e5327bcf765773b6326287e9ac86a616a0833c8daf6c4c22a271e47b8a0",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:031c6e5327bcf765773b6326287e9ac86a616a0833c8daf6c4c22a271e47b8a0",
   "tagSymlink": "58a09723",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:2c3a707f2634be16582aa3e66663ed47d44147620cc5c2ee25f0c60aa2a8e3f8",
    "sha256:469c9af9ee4cd125d8d30328bef5f962c243c143fba7715564f1bb2078d5ceca",
    "sha256:8aa38717914b054cfcf2f0de1d6d6320d08fc828291e081c80a499c7708e2359"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-node-driver-registrar@sha256:07963513c4699736be182a50f4bb11e215d0f95bffc5bb3c4fa88894df52e7a1",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:07963513c4699736be182a50f4bb11e215d0f95bffc5bb3c4fa88894df52e7a1",
   "tagSymlink": "2773ad99",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:719a14eba98e5e59888f7d77f5409456cfdc8af4864a111caa9de5390ff27dd7",
    "sha256:70164478169ef7065e5f66d8bf5f00fe7d175dead67dedf5505b561aa6d7bead",
    "sha256:1b0d6122926d9cbbe1274b38c55c96d95687e7c090adc3c7afd20c3b8bf3b4a0",
    "sha256:8fa68009539001e874798e193a43a72409a81d5903570d5620733b123788463f"
   ]
  },
  {
   "name": "sha256:719a14eba98e5e59888f7d77f5409456cfdc8af4864a111caa9de5390ff27dd7",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:719a14eba98e5e59888f7d77f5409456cfdc8af4864a111caa9de5390ff27dd7",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
    "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
    "sha256:c527dcd4c70dd833baed2781fd10197d3f92cca11c48058ade33575882a9c361",
    "sha256:017d8df1d807b7931983f2fbe399d65944fe794dc936d5d8fe00bc1bb7634fec"
   ]
  },
  {
   "name": "sha256:70164478169ef7065e5f66d8bf5f00fe7d175dead67dedf5505b561aa6d7bead",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:70164478169ef7065e5f66d8bf5f00fe7d175dead67dedf5505b561aa6d7bead",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
    "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
    "sha256:9e519d49a84dfed60862e1c8a580304a25a4a6ceb4c714dd03587062910cb4b4",
    "sha256:d2f09b060eb7a0dfbcb3eebc10a3459f8d82654623a459b94797eb821b4295d4"
   ]
  },
  {
   "name": "sha256:1b0d6122926d9cbbe1274b38c55c96d95687e7c090adc3c7afd20c3b8bf3b4a0",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:1b0d6122926d9cbbe1274b38c55c96d95687e7c090adc3c7afd20c3b8bf3b4a0",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
    "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
    "sha256:940bda011c42e014f9d9bb70a9789fa022e580411b562e7284e5a793dbfa2f22",
    "sha256:ad82ba4abcecb21c81b5c823a3b031f9f3c4c99b76a81ad87ce2b7fcadf55850"
   ]
  },
  {
   "name": "sha256:8fa68009539001e874798e193a43a72409a81d5903570d5620733b123788463f",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:8fa68009539001e874798e193a43a72409a81d5903570d5620733b123788463f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
    "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
    "sha256:b055867a7e29f3850fb03821be01324db9941e798777016531b0635b5b64287c",
    "sha256:1986f863075b70aed3ddac3e899225f9f422f97fb6ee3b7442861044f74987f2"
   ]
  },
  {
   "name": "sha256:32a1d52cfc7b91c0186e5423245bd06e525c6890ed77bca7335e56c48e2cd86b",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:32a1d52cfc7b91c0186e5423245bd06e525c6890ed77bca7335e56c48e2cd86b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:510abfcdf6bce7517c9dbde8fd24c03d8f36fe1503f65a712f824401f857aac7",
    "sha256:4a3604715398d774a2abb75d31b035aa4099557f7016e27550cefc9759368cda",
    "sha256:895b440f39821a2e4ddb80b53c39fc9e0b9954f53691b01360dc4484656c499d",
    "sha256:ae74c4523eff05b0ba9081b5fa78be34439c001362f5387aae145c43e46d48bf"
   ]
  },
  {
   "name": "sha256:a3b3a3e9a8332d3b5d5137ff89e1843e6506507c2ebb069c9a7bbfcd03dfdd42",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:a3b3a3e9a8332d3b5d5137ff89e1843e6506507c2ebb069c9a7bbfcd03dfdd42",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f2cdfe33b637eca2019910dbfd9c00211fe1aeda61fe42b23f08bb74a91e72f5",
    "sha256:6d9e8294c3485a103e1bccd5ab429804c39e30fa9217e9b8e15154afe93e3167",
    "sha256:a15f950c25bf7c55847691cba7f40084c69a3b16c808d52c33ae7e1f2aaae746",
    "sha256:28c30b7472927463bd459c926abeb07d11699bb6025e23f2a837c5122a21823e"
   ]
  },
  {
   "name": "sha256:9759e45e271ef502e2ed6f7e12dc2ecb10e39fc0cd22e195f7d47edec39ff0fd",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:9759e45e271ef502e2ed6f7e12dc2ecb10e39fc0cd22e195f7d47edec39ff0fd",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92491c8a90cf467336f6e7d283809c4de69e0141bdcf17c023b1edf310c8f678",
    "sha256:be2d37fed3de60e335e761ccc650ef174a17f8be5660b42bc5cc227b557aa13c",
    "sha256:59fa19b8a7c852313d6da30a39e527c63cb86d703a31f955d8b1d8d6c4d1928f",
    "sha256:d15d81c9adbc318984630896ccab62b8d2809b3ed4ccc24f9c1941db3fa7c18f"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:ecbd1c11787ec0a70afc230530f358ce104e553eb13d6093ec26ee80870da068",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:ecbd1c11787ec0a70afc230530f358ce104e553eb13d6093ec26ee80870da068",
   "tagSymlink": "4bd02eaf",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:32a1d52cfc7b91c0186e5423245bd06e525c6890ed77bca7335e56c48e2cd86b",
    "sha256:a3b3a3e9a8332d3b5d5137ff89e1843e6506507c2ebb069c9a7bbfcd03dfdd42",
    "sha256:9759e45e271ef502e2ed6f7e12dc2ecb10e39fc0cd22e195f7d47edec39ff0fd"
   ]
  },
  {
   "name": "sha256:44362c107867bf45198f21bf493714c38a00abbbde2393cf043613b3443eb9b1",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:44362c107867bf45198f21bf493714c38a00abbbde2393cf043613b3443eb9b1",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
    "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
    "sha256:19561cd47cd8a9dd77b40268cf73a29a3e0f73af61548b645c79d68aba3f5554",
    "sha256:b1de854749771ab55bd288e47fe0b502d5612de0dbe7ffd6bc2791ab69781162"
   ]
  },
  {
   "name": "sha256:f287dc254638e35115aa94c9c7d48837136f2c559b7997885de3400803eead68",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:f287dc254638e35115aa94c9c7d48837136f2c559b7997885de3400803eead68",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
    "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
    "sha256:b33456a99b9264b0bbad795e22f26a8dcba748e96627c66d7510ce744b9e9498",
    "sha256:ed151c224b571fa64aeae6e1932168621d61547ac36be23bb1c16b741ba2df3a"
   ]
  },
  {
   "name": "sha256:799238f3a3e8c653a9305a94a9e24331270788a46e0df482184743085ccdb11b",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:799238f3a3e8c653a9305a94a9e24331270788a46e0df482184743085ccdb11b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
    "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
    "sha256:efb5226a8d51179e2da89a5606a2bc528a5f1ece0da7199aff54c86ab80c165f",
    "sha256:440c30e59dcc79db2a22b06fe0d45bfac21b9eeb1d8ad489d83b9c78a32570ab"
   ]
  },
  {
   "name": "sha256:9711b01a0db1c6c49600898edadecb9770fdff86c7b7a61515e171d865d003bb",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:9711b01a0db1c6c49600898edadecb9770fdff86c7b7a61515e171d865d003bb",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
    "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
    "sha256:63ca0a8608ec267f814944bf017b68d90710a531d3983a38e9e407f5e0ee9934",
    "sha256:1d38b666dcfff5507e494897d9dc20bc0c655a23ef1ba65674ded6c616f85ae9"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-attacher@sha256:9f6674a2dfc651e47bd9b9cbea8368324e6c2404f4478538f29c3d67b41892bd",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:9f6674a2dfc651e47bd9b9cbea8368324e6c2404f4478538f29c3d67b41892bd",
   "tagSymlink": "f87f7249",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:44362c107867bf45198f21bf493714c38a00abbbde2393cf043613b3443eb9b1",
    "sha256:f287dc254638e35115aa94c9c7d48837136f2c559b7997885de3400803eead68",
    "sha256:799238f3a3e8c653a9305a94a9e24331270788a46e0df482184743085ccdb11b",
    "sha256:9711b01a0db1c6c49600898edadecb9770fdff86c7b7a61515e171d865d003bb"
   ]
  },
  {
   "name": "sha256:a19ae7fd01d86951507b7038e1a2c5a11514f729e542fad8dbe8af4c97cf3975",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:a19ae7fd01d86951507b7038e1a2c5a11514f729e542fad8dbe8af4c97cf3975",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:3e57d023a7b6bc2ffe6584debbe0a549379eeb517e2476ca44d91d3b11211978",
    "sha256:1253a31fa5d77fd040fac5f021bafa301e703c39e36d7b47d7961868f4ae573f",
    "sha256:8e17b25df98be50be446a4f15d69a57c2108094818dad9f38454443e41584075",
    "sha256:973acb1f6f967c914d6aee9e39541d21e1bc7880ccca5864e87c30b35dfed2c5"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-node-driver-registrar@sha256:8db12de76d7f7e80439ac2a9fb731993fcb46447749664ee804bcc9cf9301859",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:8db12de76d7f7e80439ac2a9fb731993fcb46447749664ee804bcc9cf9301859",
   "tagSymlink": "d158fc7",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:2ca588ae8217d6e52a960e89beff794f7041591f6a040bb106769a854960ecd4",
    "sha256:120b4367014f3c261fc1842b2386f12c5d451ffe9e4a92615869389fb949c6a1",
    "sha256:7dd914fee7cd7be10370b94bef6594e3cddb80fa50accf32d45816c49ecbd159",
    "sha256:a19ae7fd01d86951507b7038e1a2c5a11514f729e542fad8dbe8af4c97cf3975"
   ]
  },
  {
   "name": "sha256:2ca588ae8217d6e52a960e89beff794f7041591f6a040bb106769a854960ecd4",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:2ca588ae8217d6e52a960e89beff794f7041591f6a040bb106769a854960ecd4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:67c4675a80ba55c8715ff1339cb2a9b7a3a9cf721a5e09b4beac37ed7f400e51",
    "sha256:da5839e0efa13ff257746674543c151df660351b0451173fcc5fb464e6d93767",
    "sha256:125cd38c41c890de3345e1a3a55223f5d59b8d7a489665e52abbad4ec32a72c1",
    "sha256:87b434338ac09015ceb4b8308b591807a1b2bf5b2349a78f6d5678ecb71452a5"
   ]
  },
  {
   "name": "sha256:120b4367014f3c261fc1842b2386f12c5d451ffe9e4a92615869389fb949c6a1",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:120b4367014f3c261fc1842b2386f12c5d451ffe9e4a92615869389fb949c6a1",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:9a8fb512735a1ed60cd080c4e4907c295a1f2027a07c16f01da093fdc1c22c85",
    "sha256:f606edb6a32a7c5bce00ab71be5f987ba16eb6bc68bd6c5cefe48bc8199552ca",
    "sha256:7f04d359b4e1c357a36a160409704b645101c94818ea55df68a65633b4230e00",
    "sha256:641fbfcea4bed10d0b3f5f0f2e109f435ff7028c8b7ce7d833b47dd441b21564"
   ]
  },
  {
   "name": "sha256:7dd914fee7cd7be10370b94bef6594e3cddb80fa50accf32d45816c49ecbd159",
   "path": "openshift4/ose-csi-node-driver-registrar",
   "id": "sha256:7dd914fee7cd7be10370b94bef6594e3cddb80fa50accf32d45816c49ecbd159",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:f28d451443e29800656ab1573467a928a3a5e3cb4b482255799af5a05e78c457",
    "sha256:e9e979370e8f63ac4d551408c84e0a5051111473c8aa842aaa8e704c765be8c4",
    "sha256:b50f120c61b4039e30e73c40a0eb4a0108664eeb2a2fda88674a2f26a64536ae",
    "sha256:44b87bdf42d518320a05a669acc58b988125dbc7302644d06bc35ae3b18cb380"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:6fe55db39e35676eeb62a5ab685baea8c402fdcb9f67a32484f0663f53c59327",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:6fe55db39e35676eeb62a5ab685baea8c402fdcb9f67a32484f0663f53c59327",
   "tagSymlink": "ff0fce42",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:015116d6a075e2133159ec1e88ff40c7d1b42ff0905381feca318ca82eae6e7a",
    "sha256:134c0561a171adb65f961729ba49ffa016d13bff02f844f01e992e5c49bc3077",
    "sha256:974fa8e19bbe1e01d3a0fcf6ce30b0b31fd1281eebc155e4e6e6b898f9a11ac4"
   ]
  },
  {
   "name": "sha256:015116d6a075e2133159ec1e88ff40c7d1b42ff0905381feca318ca82eae6e7a",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:015116d6a075e2133159ec1e88ff40c7d1b42ff0905381feca318ca82eae6e7a",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
    "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
    "sha256:6f4c8192b5f1e8de4cef82c78a73e15c6bd12fcf6adf1d388ae1d1b47df7dd07",
    "sha256:e09b7ec2d5d143cd110066ea8885c26f0946a7eea6873a92712f688575e2bb60"
   ]
  },
  {
   "name": "sha256:134c0561a171adb65f961729ba49ffa016d13bff02f844f01e992e5c49bc3077",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:134c0561a171adb65f961729ba49ffa016d13bff02f844f01e992e5c49bc3077",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
    "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
    "sha256:b3834351fe9b5cdd62d3ff24218dbab88c140b142e4cf330d4522cd6b41bc066",
    "sha256:2e95a664b257291175cbf71a3851b185bf2c6d59f089d5b41381dd41a6c49d70"
   ]
  },
  {
   "name": "sha256:974fa8e19bbe1e01d3a0fcf6ce30b0b31fd1281eebc155e4e6e6b898f9a11ac4",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:974fa8e19bbe1e01d3a0fcf6ce30b0b31fd1281eebc155e4e6e6b898f9a11ac4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
    "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
    "sha256:75870b1bfa34c0def3c74b5f1cb433997da532d376be1d0c8f08f4d326989e44",
    "sha256:9ce723015eb5e6853586230224b642934fb688f13d614c78b599bf2aac6777ac"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-csi-addons-operator-bundle@sha256:33d5a81a5f78a4a63c1fd4c7bad0b0ec82beef5b847025ae1d097248a59705d2",
   "path": "odf4/odf-csi-addons-operator-bundle",
   "id": "sha256:33d5a81a5f78a4a63c1fd4c7bad0b0ec82beef5b847025ae1d097248a59705d2",
   "tagSymlink": "fbc9d4f0",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:563b783fc33a73c2714ee20950f3642df05857c9292ab2a628b0bcd3a8a6fb2d",
    "sha256:c5e05b4c674a494caaa603fc6e97359297dfe94f8e7d61b68d79ca4e3ae423e4"
   ]
  },
  {
   "name": "sha256:4e08a9f898861aa590dc111dfc83c8bcceeaaebce3287d42ad0ec308900f4706",
   "path": "openshift4/frr-rhel8",
   "id": "sha256:4e08a9f898861aa590dc111dfc83c8bcceeaaebce3287d42ad0ec308900f4706",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
    "sha256:a4f595f195c3b56b0e26800a2e8a533305ca66685e9e6e0c2f8658748a0200aa",
    "sha256:48e5b0263cffeabcc3e1ea333161efbc6c87bbdb3393d66ef6e61f8e46b1fdd3"
   ]
  },
  {
   "name": "sha256:40f5830498be3c855d22e3a420b0671ceda22415202050b0b766edf3f6acd2bf",
   "path": "openshift4/frr-rhel8",
   "id": "sha256:40f5830498be3c855d22e3a420b0671ceda22415202050b0b766edf3f6acd2bf",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
    "sha256:2e08df6a0c245c08ec9b632f6b2928aedfaf83b4e757089b464ceb03d99a7f8d",
    "sha256:7baf616439cffc2009ded159af4b5fb7643252c52c4e8ddde18c4fa8e37cc0f9"
   ]
  },
  {
   "name": "sha256:f9c86f088c8bbc418ef6466686b4e583328cfadc815fec6f5b0f535eb87c3dd2",
   "path": "openshift4/frr-rhel8",
   "id": "sha256:f9c86f088c8bbc418ef6466686b4e583328cfadc815fec6f5b0f535eb87c3dd2",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
    "sha256:13edb702211b6f93218a6d6ce87af88d5d097263dc121d353b7101619dce8823",
    "sha256:9e8876d6398b50792ad817c41fd69a6f3b628384448ba46d7a0f13030d352282"
   ]
  },
  {
   "name": "sha256:1ef1ed1a5da62c54c2f04638d85434d2622072ce98f034b859250000e0ccea3f",
   "path": "openshift4/frr-rhel8",
   "id": "sha256:1ef1ed1a5da62c54c2f04638d85434d2622072ce98f034b859250000e0ccea3f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
    "sha256:7c18f4c91232a705a27fb0b165530143763f6fd8d0b6a2f176ead3af24756163",
    "sha256:6510155546d525d87b87acabab5809d74f316123d282ebf4ce65a4020d1d306d"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/frr-rhel8@sha256:ab55c4fcca7d9f0d77f9a6cd039b680f84f44baa6c5fe18b1f11775ed45a39a0",
   "path": "openshift4/frr-rhel8",
   "id": "sha256:ab55c4fcca7d9f0d77f9a6cd039b680f84f44baa6c5fe18b1f11775ed45a39a0",
   "tagSymlink": "3013aa65",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:4e08a9f898861aa590dc111dfc83c8bcceeaaebce3287d42ad0ec308900f4706",
    "sha256:40f5830498be3c855d22e3a420b0671ceda22415202050b0b766edf3f6acd2bf",
    "sha256:f9c86f088c8bbc418ef6466686b4e583328cfadc815fec6f5b0f535eb87c3dd2",
    "sha256:1ef1ed1a5da62c54c2f04638d85434d2622072ce98f034b859250000e0ccea3f"
   ]
  },
  {
   "name": "sha256:1490f6450046ee1618e23edfe91efbf2b416990a654a8f9cb6a390f8ea041aed",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:1490f6450046ee1618e23edfe91efbf2b416990a654a8f9cb6a390f8ea041aed",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:ad97e575305d0fe909119e65ccb5d87c548cd57a184031a1ae3d625374239b8b",
    "sha256:6769672a4f0ff52966e1802a3ec0cbdd474a1000072b4e5a473c6bf02ab4e11d"
   ]
  },
  {
   "name": "sha256:c29bf5a76486cec63642ea83ed39cf52e6522aa8a5673ca7f57462fb4e2c163f",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:c29bf5a76486cec63642ea83ed39cf52e6522aa8a5673ca7f57462fb4e2c163f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:5c8dc6dbe4d5fc364e2920ccaa0787f00a1fef9f8b9eaec56cacf52bdbec5a68",
    "sha256:81e58d224900216681284e04bbe5bcc19316cdf1ce057b047014f4329616a0a5"
   ]
  },
  {
   "name": "sha256:f7e9d3a9e07bc4bcce8ca42866945e943cd6e0836ef70c3800fe14350a770721",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:f7e9d3a9e07bc4bcce8ca42866945e943cd6e0836ef70c3800fe14350a770721",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:fbe11182d31208e22a172f7d1aa02f210ea40e7b427dea13c047a18075d0a26d",
    "sha256:ceeb36a1813e8c31819081c6a37a53a07f3f03b50768be3c23294f1c9576a3ff"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-rhel8-operator@sha256:60cb495cd4230eb5709c71dbcf64d8380438bde845abe026f06237bc6dede58f",
   "path": "odf4/ocs-rhel8-operator",
   "id": "sha256:60cb495cd4230eb5709c71dbcf64d8380438bde845abe026f06237bc6dede58f",
   "tagSymlink": "f6fe50a3",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:1490f6450046ee1618e23edfe91efbf2b416990a654a8f9cb6a390f8ea041aed",
    "sha256:c29bf5a76486cec63642ea83ed39cf52e6522aa8a5673ca7f57462fb4e2c163f",
    "sha256:f7e9d3a9e07bc4bcce8ca42866945e943cd6e0836ef70c3800fe14350a770721"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:baf051a5c64d8f85ae2701131ee96cb100a81ce4bed77d3a8962fd44d4d2b6b0",
   "path": "odf4/mcg-operator-bundle",
   "id": "sha256:baf051a5c64d8f85ae2701131ee96cb100a81ce4bed77d3a8962fd44d4d2b6b0",
   "tagSymlink": "12067fe8",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:1c8512cbaef01f40fe8a8821364d1721b2658ca6b4f5beca4caa54329aaa0e4d",
    "sha256:e44b552b4a741af4cdd84519c7ab74ad9566d2251837451da3547b68862a8d3f"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-operator-bundle@sha256:1cbe53d6e1ebbbacef1bcb5459aa3ad882568aa006b059bd334287363eb35aae",
   "path": "odf4/ocs-operator-bundle",
   "id": "sha256:1cbe53d6e1ebbbacef1bcb5459aa3ad882568aa006b059bd334287363eb35aae",
   "tagSymlink": "8df71831",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:511c3b6b090ef36d2e7c946dc7ed28378b218a26f964540d5aebf5c384039785",
    "sha256:f9acc026c1596b5a3e5c346681b3ea72cff8adc67478d6bca2be075d5224b0a9"
   ]
  },
  {
   "name": "sha256:f2705a25e28b2a27533def0a0a98731993bfc2a280c13fb126a16b0e21b2a70c",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:f2705a25e28b2a27533def0a0a98731993bfc2a280c13fb126a16b0e21b2a70c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:ae0bac2b84044140b992621171917bc6c4e6b61cc949f05a1c7e682c3d937228",
    "sha256:52c931688d739d665be9d4831efea30ea62507c17e99027893b35d4a0436ac95"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:96d1590494e8d4d402426affba7f79239ecdc92195b8888220d2a4cdd229b0af",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:96d1590494e8d4d402426affba7f79239ecdc92195b8888220d2a4cdd229b0af",
   "tagSymlink": "41796b1a",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:55b7c96cf870d6afdf79bf0bd170096a04b99d2edaa5173e51ff3a8934ad2720",
    "sha256:1ab1758d199c68fa96eec27dc2b03c8cf8b5585d3cc3e9eb55fac51bbf620906",
    "sha256:f2705a25e28b2a27533def0a0a98731993bfc2a280c13fb126a16b0e21b2a70c"
   ]
  },
  {
   "name": "sha256:55b7c96cf870d6afdf79bf0bd170096a04b99d2edaa5173e51ff3a8934ad2720",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:55b7c96cf870d6afdf79bf0bd170096a04b99d2edaa5173e51ff3a8934ad2720",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:2d19f5c578bff65c862573cb16cc006e3b2ed20fedf5a7db0ee4e3f3ca98261b",
    "sha256:a3d6cefbf56de4db1b2d3f583d5166b18b338601d3ac9ac75b7f27fcc259c0a7"
   ]
  },
  {
   "name": "sha256:1ab1758d199c68fa96eec27dc2b03c8cf8b5585d3cc3e9eb55fac51bbf620906",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:1ab1758d199c68fa96eec27dc2b03c8cf8b5585d3cc3e9eb55fac51bbf620906",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:32b99b51a5791f7c1cc2fe54140515af9760ad8ecf438b29705141a7c2f8660d",
    "sha256:27f63fb5b091c728694cc84cb2b07b4f022b7c24953abc2f12236de8412d46e7"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:5db2f10f6a73ad0c3598e407ae2dba25bf4d0655d0c1b3c7fdab9802a44da796",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:5db2f10f6a73ad0c3598e407ae2dba25bf4d0655d0c1b3c7fdab9802a44da796",
   "tagSymlink": "fc9cab52",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:04877f23ec28b278ef01bf80a7ed72e0bd7fc8bbf949afc77173e5b85cf1a4a3",
    "sha256:e78511467f01d4ebfab0661aba4f0fc1f26d7ce8ed197dd728b1111005d51e18",
    "sha256:cc79319542c17b694a4cd012631e6d7108195fd6aa44f51308cf176f7221814f"
   ]
  },
  {
   "name": "sha256:04877f23ec28b278ef01bf80a7ed72e0bd7fc8bbf949afc77173e5b85cf1a4a3",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:04877f23ec28b278ef01bf80a7ed72e0bd7fc8bbf949afc77173e5b85cf1a4a3",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:1b890c73c3cf60b04334fded9e3edc647d64dd39ffd078317e2bd69552a2fd1d",
    "sha256:de63ba066b7c0c23e2434efebcda7800d50d60f33803af9c500f75a69fb76ffa",
    "sha256:b2a723a1165850255e84a64214f06e6adb9ff3f3290e0b35132313684af7b621",
    "sha256:744ccb82a0911da395dba3581dc5b278b98e45984b663c5ba97991dc778ab0d9",
    "sha256:8e2e3b99e9f8b557f0d581368e40ce72c145cc5595b3a080585b430753a6e2db"
   ]
  },
  {
   "name": "sha256:e78511467f01d4ebfab0661aba4f0fc1f26d7ce8ed197dd728b1111005d51e18",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:e78511467f01d4ebfab0661aba4f0fc1f26d7ce8ed197dd728b1111005d51e18",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:9f78280d50082c329e73123d73b3debc7f5eec007d8a0c7b1d388ff69b9652fc",
    "sha256:a1a64b9c0d1a2a468c65bf81fb26d51416a3e19d95d08df39e5d7d012a25b685",
    "sha256:f7109c3dbacb07ae738be8afb80c1d580757c61c03ec5e18ef2fa600b7823d26",
    "sha256:43a0fce968d1a7b1a451f4b0871488548538dd7d63b2131beb60bb4e7dc1faac",
    "sha256:7d59f905d8cf24a7c9374249eb8224a329ae0d132dee0e7e4e97bdc6a0cc8b67"
   ]
  },
  {
   "name": "sha256:cc79319542c17b694a4cd012631e6d7108195fd6aa44f51308cf176f7221814f",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:cc79319542c17b694a4cd012631e6d7108195fd6aa44f51308cf176f7221814f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4f639942cb5a04cfde9e90ad4590927d87ec970f46186ebe46182c2f0657584d",
    "sha256:261c17695cc21090e4719a05e282f024f0ab9a36997b3e3550ee7a97dee98668",
    "sha256:aa345f2f6695ebc5e00997e8487c157fd9669cc8cfcb7dfabe3b00bb7ae5a4f4",
    "sha256:759caabab663238cc4bb6da4aad63c00e19a0dc3ab5dd2f4f0f3e48296ce677c",
    "sha256:545da8f1e07f8a4f18e0f92960352f33663132fa335a99eb9c5bdef02e3e46b3"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-operator-bundle@sha256:e1ae5ed85e17ad3cdbdc5049f5c3064f2616c5a6f445ec9d38e7f915d494776b",
   "path": "odf4/mcg-operator-bundle",
   "id": "sha256:e1ae5ed85e17ad3cdbdc5049f5c3064f2616c5a6f445ec9d38e7f915d494776b",
   "tagSymlink": "8d55c08f",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:c0623c3007249c90f82a7125f2118db2989ec342792cde89b0de0cb5f969f8d6",
    "sha256:34d2f8fc28425411f63f7265e8e2972076b6df6e3aead514a9500a703e3e67ec"
   ]
  },
  {
   "name": "sha256:4d863979f67280825c7a10cbcebc495972e3d0ac58f10f63987706d6f8c8f60f",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:4d863979f67280825c7a10cbcebc495972e3d0ac58f10f63987706d6f8c8f60f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
    "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
    "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
    "sha256:5440aed08ab7b424005a1a8f5b4a7231cb1160fe18b19f8ecabda37c5e5d7a50",
    "sha256:902dc0073b2a864e58986625bdcfa3cdb466a9a980909dae1e154c5ced3f8922"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:39431c0f4359b85b1a09bf239761672b906375a08163d3f98a5c30de2ea76a1f",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:39431c0f4359b85b1a09bf239761672b906375a08163d3f98a5c30de2ea76a1f",
   "tagSymlink": "e3091999",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:8fabff5be7802f8de5f1026893ae4f7bafb66a1e1f70df16c667e537ee0bedcd",
    "sha256:afb3f630b3215e327122688dc9edf0b651fda692c29a2b861df7357492f54702",
    "sha256:4d863979f67280825c7a10cbcebc495972e3d0ac58f10f63987706d6f8c8f60f"
   ]
  },
  {
   "name": "sha256:8fabff5be7802f8de5f1026893ae4f7bafb66a1e1f70df16c667e537ee0bedcd",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:8fabff5be7802f8de5f1026893ae4f7bafb66a1e1f70df16c667e537ee0bedcd",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
    "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
    "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
    "sha256:bce5136717acb536d29c841115a063a3de5343c0a512345746bab9d8891cd29b",
    "sha256:418a27e7118f6d840dc543cef588560cc4c6b2a8b4a19614b95211ae07706c7e"
   ]
  },
  {
   "name": "sha256:afb3f630b3215e327122688dc9edf0b651fda692c29a2b861df7357492f54702",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:afb3f630b3215e327122688dc9edf0b651fda692c29a2b861df7357492f54702",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
    "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
    "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
    "sha256:c42912b5ec04d6e7aa99f0a0a2d2c3c312b4df50651b6953ac1c5dce374477c2",
    "sha256:cee83529a608e71515751123732f36b1fe357029c864259bb0ae080aa20bc6ae"
   ]
  },
  {
   "name": "sha256:060ded5b7815eb6ac09668db63940152eb4c39ecfa618626ec48c544b09f522a",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:060ded5b7815eb6ac09668db63940152eb4c39ecfa618626ec48c544b09f522a",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:a7635174fc67fd997681528eb831bf1c492bbb6b30ffd430aca98a9a89975bab",
    "sha256:804449b22e26cc93ec79fad318d5af873434fe344ccaf377c2487df2ad851776",
    "sha256:523d8b62e30259efc379b2c40d2df107709a99f07a97c1f3ebc85abc96c92242",
    "sha256:1ec191b35daa7695469cf903435977735acbcd252c6125afa2facc462e79a368"
   ]
  },
  {
   "name": "sha256:f1ceb53b087629a6c76e9c76ab54b79edd0b12d036e0d3f72ba59b193cdd48cd",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:f1ceb53b087629a6c76e9c76ab54b79edd0b12d036e0d3f72ba59b193cdd48cd",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:39c2e2e251f3ddf398d2248c5d89985bdcc3b44b536237d3183782d88fa979d8",
    "sha256:ae98442e6064d90067bd5c713a9d7c1498c3672c008df8f09637c72ba95a2697",
    "sha256:1e4833636725ad03833bc18c35dfbf7ef57c9d3f94b94cdab0aee68a6d25723d",
    "sha256:953608ca8bb7e08d2fe0a6ca28be6f0d93ce4d2eaec42bb8cfdc2410e66f30ef"
   ]
  },
  {
   "name": "sha256:4e3c86fd37ca3982998087b1572a281fd65a92a76f499b60c02a9471206b2daf",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:4e3c86fd37ca3982998087b1572a281fd65a92a76f499b60c02a9471206b2daf",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:3d90b5061b4c977b44109e0a3b8f712dcc818daf4f56da0da911b4192a7cd9cb",
    "sha256:6be0e32da4561e531283d2246d389bd9e1c2c874e68bd9891597caa56575255a",
    "sha256:a626aa3e9c312a3b9ff16868d760c1d055cf37e4354a9c711a846e7dd22fa83d",
    "sha256:8b57b0f969f56d584801898567a23d75dbb79a7d90c92beb5b9b29ab89604ef1"
   ]
  },
  {
   "name": "sha256:7126555f8bcb85017ed64669ddc5efc6bd9347f41195fdb073f5bd04153dce71",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:7126555f8bcb85017ed64669ddc5efc6bd9347f41195fdb073f5bd04153dce71",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:2deb13dd7f2d391601a7763bba4edf4d8f1c72bf031da607332796897e0fced9",
    "sha256:99e48820ab0f5f383a8ee7cdffd4a43f0239b5354e9b0acf24d2f21648b0985f",
    "sha256:7f6121bb2c022862c0b05041e8298555ca7eba0b318c0183b90c3b6225d123de",
    "sha256:9fa3d4c221dbddc018db69c0ac7f696ef5d61d4417cf81ca61d7abc73b642665"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-provisioner@sha256:95010584242f9705ffad17632bd11cf1299955b986d1e5b4b8892f9fda75bb00",
   "path": "openshift4/ose-csi-external-provisioner",
   "id": "sha256:95010584242f9705ffad17632bd11cf1299955b986d1e5b4b8892f9fda75bb00",
   "tagSymlink": "5212fcb6",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:060ded5b7815eb6ac09668db63940152eb4c39ecfa618626ec48c544b09f522a",
    "sha256:f1ceb53b087629a6c76e9c76ab54b79edd0b12d036e0d3f72ba59b193cdd48cd",
    "sha256:4e3c86fd37ca3982998087b1572a281fd65a92a76f499b60c02a9471206b2daf",
    "sha256:7126555f8bcb85017ed64669ddc5efc6bd9347f41195fdb073f5bd04153dce71"
   ]
  },
  {
   "name": "sha256:3fd5abf8575901f8767f6c16b7292d4dee3db3d2f67d880816556f732b85f561",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:3fd5abf8575901f8767f6c16b7292d4dee3db3d2f67d880816556f732b85f561",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:3d4679d6550ed04bed8f137eccb2f5198efb4491950ec50f15831eda1b6ad963",
    "sha256:ebd5e372fd9eeeb6cf72dace1739f03e57e4e455e6847ae3b9b719b9047c3c6c",
    "sha256:b01bce94b999d5d3749604f16676f68d6250aa412f9cd55c72316dea4829eabf"
   ]
  },
  {
   "name": "sha256:432d27b68fc233b3064c6fdcacc009f181c92be20c598f3d9daff063761a30b2",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:432d27b68fc233b3064c6fdcacc009f181c92be20c598f3d9daff063761a30b2",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:abad6baafc4cb0a77e481dea4a8bc47a7ed5b5c944d494c18bfbec3aeba4e8cc",
    "sha256:7f6958b3f9b37a37e83436801b2cfa682876b2e5c32c6d15e53354d3259ccdbd",
    "sha256:0b08a5d3b21505c482af4755ff696cace4b3e3b9407ebce453912b10cd37c70a"
   ]
  },
  {
   "name": "sha256:e7ca9c85a1ba70fc7523d02e940b51ca5dc8b3fc895971c81e0f3681fb5e56fb",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:e7ca9c85a1ba70fc7523d02e940b51ca5dc8b3fc895971c81e0f3681fb5e56fb",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:ac3143d6092da265fe38fcde94e5aa790146bc14fc0580c8093e76bac041cda5",
    "sha256:e88acdd86e05d8f703e0a5782e0c388753ed7e742478fddd36351e36506882e0",
    "sha256:8f6edfdaf629483f03c377faaf02ca6bf295f104bca2f0d4850c38b237dc83e8"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:01caee70dcd8eec596863049256c757e0f39cbf87dfdfde557053f3be58bea3d",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:01caee70dcd8eec596863049256c757e0f39cbf87dfdfde557053f3be58bea3d",
   "tagSymlink": "ad6afec7",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:3fd5abf8575901f8767f6c16b7292d4dee3db3d2f67d880816556f732b85f561",
    "sha256:432d27b68fc233b3064c6fdcacc009f181c92be20c598f3d9daff063761a30b2",
    "sha256:e7ca9c85a1ba70fc7523d02e940b51ca5dc8b3fc895971c81e0f3681fb5e56fb"
   ]
  },
  {
   "name": "sha256:ed2a3ffb5bcc749255ec4a194763c8f2739dc58fb00489ec1ebaee22ba85c527",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:ed2a3ffb5bcc749255ec4a194763c8f2739dc58fb00489ec1ebaee22ba85c527",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:9ef334919d82346308da0afe70becce00627b3fbc1a00522536744cbfb9c6c26",
    "sha256:66ab094148e45140732dcaabf86556d54f557433f1c04f2023c07361c8d1c374",
    "sha256:fa0f649116d57cb1e71e21390648e1b8d28020bd6c1ce9de6f59754cc997e5d6",
    "sha256:8dc8589a740137593585f23b60ffe5ead16ba2fc393f91f5fc973eb5fbeb78ac"
   ]
  },
  {
   "name": "sha256:529333833d11d38c066a6348efcd7003db77e20a53533cf4a26e362a522eac71",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:529333833d11d38c066a6348efcd7003db77e20a53533cf4a26e362a522eac71",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:ff243c3fbb0a41c7a8671c4d12bbdbf03b78409775d1b12984ed762ba38f6190",
    "sha256:5cc416c2eece8565d9bd5873415311f00720219ab893017828ac19e258d3a778",
    "sha256:82c8ac24f94dee8d28fa6febb4afc7b07a1a9b32011c1b81c4a74965d82b0a56",
    "sha256:1c300c4421a2656761d7565eda6c95ca35ba9c47f1f502af2a988c87a9717824"
   ]
  },
  {
   "name": "sha256:f15139b941df32b25eeba961d4401f9518bd5f78f2cd4c1560d8f51fe75ded8f",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:f15139b941df32b25eeba961d4401f9518bd5f78f2cd4c1560d8f51fe75ded8f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:b5d8362f447bf1eff61f40e67680858da73eda6582073c3ba1a789633ca1341a",
    "sha256:9d34e20a14f1aaecc11a8a696710c0f06d8599848f2227cce09ab44ef6877483",
    "sha256:bb6c009b1f28251d380c066ab170e8cbbb3bacd8eb2f82c50877f77d5920f693",
    "sha256:c0cfa1478ca9015ceb990703aa4c985afa69560ebfb8c8418dadc8b6bca9bc0c"
   ]
  },
  {
   "name": "sha256:61283bec3d3600feab582b3a755a0ce902b9b7e3711b0a73373b14b5ec33c53d",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:61283bec3d3600feab582b3a755a0ce902b9b7e3711b0a73373b14b5ec33c53d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:c8bce38a7813e0c5cd799b4ed7993e0186651e03f9e5e68dc4893a9bd8421eaf",
    "sha256:a231d9ec3b27836a86db1e09d1f545f161785157ba66d2521f4d6cfd8fdd1e15",
    "sha256:e565cc8719280bfaeea78ea249fd3b28d161b430de621e0c3c3937516bc6bc57",
    "sha256:f637054c65b0b40cb4475bd8277e3145d58f8df24b2022d500fc639370e95fcb"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/ose-csi-external-attacher@sha256:47d907d24cf9a0cb4496af688785a8485eddfebd70379f082bd58fd2883a46bc",
   "path": "openshift4/ose-csi-external-attacher",
   "id": "sha256:47d907d24cf9a0cb4496af688785a8485eddfebd70379f082bd58fd2883a46bc",
   "tagSymlink": "a077187a",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:ed2a3ffb5bcc749255ec4a194763c8f2739dc58fb00489ec1ebaee22ba85c527",
    "sha256:529333833d11d38c066a6348efcd7003db77e20a53533cf4a26e362a522eac71",
    "sha256:f15139b941df32b25eeba961d4401f9518bd5f78f2cd4c1560d8f51fe75ded8f",
    "sha256:61283bec3d3600feab582b3a755a0ce902b9b7e3711b0a73373b14b5ec33c53d"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:512e708ecb13c608430a5edd11fd2c52a47bebed33851d7aa80ef35003a15076",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:512e708ecb13c608430a5edd11fd2c52a47bebed33851d7aa80ef35003a15076",
   "tagSymlink": "2a458219",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:7b352c6705f3b8604c3fceecc825bcb5d78b185211ea4a9bb9741f1878eed963",
    "sha256:7d18d513f660417cc5b676f495ac1889ef356ac2afaaabfcf95ccbc0e952077c",
    "sha256:a4a0e2ffaa192739b746a2f678ccf6a8133a96fd34ad5186d14499ab3f98fbf9"
   ]
  },
  {
   "name": "sha256:7b352c6705f3b8604c3fceecc825bcb5d78b185211ea4a9bb9741f1878eed963",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:7b352c6705f3b8604c3fceecc825bcb5d78b185211ea4a9bb9741f1878eed963",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0c673eb68f88b60abc0cba5ef8ddb9c256eaf627bfd49eb7e09a2369bb2e5db0",
    "sha256:028bdc977650c08fcf7a2bb4a7abefaead71ff8a84a55ed5940b6dbc7e466045",
    "sha256:6c97fa2291463eee9a225acd21f6c5d544134176fcfac43f61e614362d22443c",
    "sha256:38df80357e025638dd2bd39c40a89d336a38531842e23ed50ea41b63d7657bad"
   ]
  },
  {
   "name": "sha256:7d18d513f660417cc5b676f495ac1889ef356ac2afaaabfcf95ccbc0e952077c",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:7d18d513f660417cc5b676f495ac1889ef356ac2afaaabfcf95ccbc0e952077c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:7472fa517fd188919c3ff6ec27806dd20311bb57e1e34a7f3998734688fa7b42",
    "sha256:9f6eca53e5bceb7b88b4c078cc5d939e61d13301d8bdccb6b68eeea4d3879f3e",
    "sha256:73010716aec388bfab246441a45859a9378389d40c848654a75ab6d985f524aa",
    "sha256:a61be58981ba4e5381602db60afbae7a456d81545eeed03a0f41cdb49dc6405e"
   ]
  },
  {
   "name": "sha256:a4a0e2ffaa192739b746a2f678ccf6a8133a96fd34ad5186d14499ab3f98fbf9",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:a4a0e2ffaa192739b746a2f678ccf6a8133a96fd34ad5186d14499ab3f98fbf9",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:744db8e918c5c882f601488dcdbe3c4e9fa01913fe57119975eb5b16a18f6250",
    "sha256:d851aca55b090483dcda2af05dbf048848399647d96dd3d4089f92d35f827db7",
    "sha256:ca41f6878aa10e808b14ddb5c7a4dd8233fab5d659bb89cebe41d3924941bf80",
    "sha256:1aeeb8c532c31e4aa2e825ee1ac1a4d597bb4cbe7b580c90cf9c4093d0c16ee0"
   ]
  },
  {
   "name": "sha256:5e83e64efba36b0a3181c346a129bdfe449beeb424a6e27e6e0dc1cf55030617",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:5e83e64efba36b0a3181c346a129bdfe449beeb424a6e27e6e0dc1cf55030617",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0a21bb5475ea5fbcfdeab2bbe08a1cf4ef0b55382d553d2c213620763078223c",
    "sha256:38dd71adcfc1f964c6f3ba6ae3b6daa95f612681cfb05298b225bb6347942f56",
    "sha256:089450f9e18cf52c000683a6b8c6dbb3b03adea57902c427b26709afbe78a8d5",
    "sha256:8dd62dfa2966bbeb29717c3e4cf7a076bebe379ec22a251416097e280488fe67"
   ]
  },
  {
   "name": "sha256:1dd893fd1b62cc70d2006fb4bf26a6af302b4052626f0a27849217c111537215",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:1dd893fd1b62cc70d2006fb4bf26a6af302b4052626f0a27849217c111537215",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3abc8c0d3d4265b5efb17447cd4a399fc70858b08d7cd5dce88dca7a09bc089",
    "sha256:ada7e11fb107d011a3b016cc659ca3f138f11725949328d92d3714ac15ef4ce2",
    "sha256:9ec07bbf47f0a21053e851d540e0dc713a0cf4570898750f659a3a9c8d783dca",
    "sha256:8c7ff62ae1f9a5cc24a5e2479d6cf9610b9c25086584f78cf02c0fce978e111b"
   ]
  },
  {
   "name": "sha256:b194288242da1d3c2224c15882b25777bf8c13f25a3894256d8a91d95bfc29ed",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:b194288242da1d3c2224c15882b25777bf8c13f25a3894256d8a91d95bfc29ed",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92559d5f5a908101d2776f8e756d73806b2bd3354be51e12d3111c90a4f09b07",
    "sha256:083e3eac55c875258c6477c979a400f62751e489a5aa9ffbbf0bf0bfdf773bcf",
    "sha256:83edb43944ff4d38439b9816947450429f8a021c11f34dc703e704265d58ae89",
    "sha256:a194a6c5c0ff3a3bbec22a4b7eccaa29353cac7bf94d121a6c3e7823c1b20f07"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:40da9aaf63ead51b72bc2a25e36f2a178fbbc404653b7c90dc1f36e1c191316b",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:40da9aaf63ead51b72bc2a25e36f2a178fbbc404653b7c90dc1f36e1c191316b",
   "tagSymlink": "9f217696",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:5e83e64efba36b0a3181c346a129bdfe449beeb424a6e27e6e0dc1cf55030617",
    "sha256:1dd893fd1b62cc70d2006fb4bf26a6af302b4052626f0a27849217c111537215",
    "sha256:b194288242da1d3c2224c15882b25777bf8c13f25a3894256d8a91d95bfc29ed"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:c676426bfc0eeeace11aaeb46167e5a90f54be4c4320ffb2f5a71fde054dba54",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:c676426bfc0eeeace11aaeb46167e5a90f54be4c4320ffb2f5a71fde054dba54",
   "tagSymlink": "d1d9e249",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:91fea6092eaab3eae582c83e2b4a607d4ab57986e5545993483cf1cc077a2725",
    "sha256:2ed76c113d93e94cfd242b1b59f2fc5c6efa203687b6ff07dc1ebd7d77c3542c",
    "sha256:ef95a9a7c27a7f35b44caf6270dc6fdea394732a3929c1f11525ab159fbae276"
   ]
  },
  {
   "name": "sha256:91fea6092eaab3eae582c83e2b4a607d4ab57986e5545993483cf1cc077a2725",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:91fea6092eaab3eae582c83e2b4a607d4ab57986e5545993483cf1cc077a2725",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0a21bb5475ea5fbcfdeab2bbe08a1cf4ef0b55382d553d2c213620763078223c",
    "sha256:38dd71adcfc1f964c6f3ba6ae3b6daa95f612681cfb05298b225bb6347942f56",
    "sha256:408d72b5afe1db674fd2e4bd38c8ca7138ac3c5d1b523be9fe48fcc674660890",
    "sha256:f709798e835fb171af14a66fabad7821e61358c88a7681666a109a28ae97d88a",
    "sha256:6a8269417675d413d10593d4e58e9230e67d119fcc90dbdc95956206fd34cd38",
    "sha256:2c6dc0abaf54c0118c842fa0fa50498ecf4b2ce19e20a6300536cec8a8bd0ad1"
   ]
  },
  {
   "name": "sha256:2ed76c113d93e94cfd242b1b59f2fc5c6efa203687b6ff07dc1ebd7d77c3542c",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:2ed76c113d93e94cfd242b1b59f2fc5c6efa203687b6ff07dc1ebd7d77c3542c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3abc8c0d3d4265b5efb17447cd4a399fc70858b08d7cd5dce88dca7a09bc089",
    "sha256:ada7e11fb107d011a3b016cc659ca3f138f11725949328d92d3714ac15ef4ce2",
    "sha256:d84558a70da2c2b3d51676a2caeeee48c18fd37f2ba3e39fa42baf8ddfcb4742",
    "sha256:50ca6a96e05b73227186687cf370829661c75ac0a0c83b0cc7f4a762f0edec80",
    "sha256:b9e53a323da4866c05ba364aecc3e560e17c3998ec591667faac7c43477d5d60",
    "sha256:6b88b2ca0a430cbeb6274da9d26a8fc79c4c27f8298297a00483a6efa57df12f"
   ]
  },
  {
   "name": "sha256:ef95a9a7c27a7f35b44caf6270dc6fdea394732a3929c1f11525ab159fbae276",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:ef95a9a7c27a7f35b44caf6270dc6fdea394732a3929c1f11525ab159fbae276",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92559d5f5a908101d2776f8e756d73806b2bd3354be51e12d3111c90a4f09b07",
    "sha256:083e3eac55c875258c6477c979a400f62751e489a5aa9ffbbf0bf0bfdf773bcf",
    "sha256:71cf785318807dbca4c866feb2e756e67c6898947ac3ff0410374dac21595113",
    "sha256:599336d681de5f6758c6432ce16f750563ecbcd827af554aa926123cba489bfa",
    "sha256:c7f6b0ca7d55387a874c735018f1bb58d47fc714072a271ea481f04cf27496a7",
    "sha256:cbe31bb348b34a9857e7814df8a53557bdf8517f6bdbe8832123a9ec4a2e6b8b"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:662ec108960703f41652ff47b49e6a509a52fe244d52891d320b821dd9521f55",
   "path": "odf4/odf-operator-bundle",
   "id": "sha256:662ec108960703f41652ff47b49e6a509a52fe244d52891d320b821dd9521f55",
   "tagSymlink": "9f4fe91c",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:2a1e45641c394d85682323f95b633249acfe013553aa77b053e7250b49847bf6",
    "sha256:80d0a4b62813fbb512ae57929f230ec6a64e7272e43054ad189c36094d92f33d"
   ]
  },
  {
   "name": "sha256:f5442fb0fdc59a61ae9ae2cc80307311c75901e358203363024bfec9d7459310",
   "path": "rhel8/postgresql-12",
   "id": "sha256:f5442fb0fdc59a61ae9ae2cc80307311c75901e358203363024bfec9d7459310",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3de00bb8554b2c35c89412d5336f1fa469afc7b0160045dd08758d92c8a6b064",
    "sha256:c530010fb61c513e7f06fa29484418fabf62924fc80cc8183ab671a3ce461a8e",
    "sha256:6c155a0c493b106911b1fa3b975be2fc7e07ef3e8619b7d5b0d169488fce15d3",
    "sha256:4ab553311773e89b1b5ec08c47733cc2b3d17e8d79413bfae843e1f77a9105f8",
    "sha256:ef02a146c1d4df822ad227a672adb4af9d4f7dd92a475437b510d01915952efc"
   ]
  },
  {
   "name": "sha256:1532f94a16f9f49d5f5c825f0b6ebe7a8d5d76ed9d25441b43a92b8b525dde0a",
   "path": "rhel8/postgresql-12",
   "id": "sha256:1532f94a16f9f49d5f5c825f0b6ebe7a8d5d76ed9d25441b43a92b8b525dde0a",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:fea832e2f3124138814b2fa9f97e4c93af9846cd754bc170735a04fcc2b3efa0",
    "sha256:24639a74db0ea60a6d9ce7dde38c65c804be51901b34b3dcb4801ff37d88c968",
    "sha256:cc9caec422c32b87d970d6145020cefeb6ba204d046c1eace4316557caf0218c",
    "sha256:82f77fb505ad1592e5885bfcfc80c4349e23a1c48089882971df39c65f2c56bc",
    "sha256:cc8617b2d0d27a78bfa3577cd45d6c843113a17fd4e8e9a3e7ce9b77a0cfce41"
   ]
  },
  {
   "name": "sha256:abba41cd0355e95f5e5e557829c2fe0f55c096c495e8a524e5c6c99670ea7812",
   "path": "rhel8/postgresql-12",
   "id": "sha256:abba41cd0355e95f5e5e557829c2fe0f55c096c495e8a524e5c6c99670ea7812",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:2cbc2866f0e2741aa3c72c6a699db0f8b25a5a5fea7d49ee2aa4f9a97ec6ee4c",
    "sha256:17e3a5f768e10e019b5bf765f63f8f9243bdfc7856b6c5b92b2b93430a7a91e7",
    "sha256:94d83113c109588bc1fa214757a0039e7f30de42ed7198534778862ea0808ec6",
    "sha256:cd3ead44e62789c554435efdcdf55757466101c8e174bef39c22f9978436640f",
    "sha256:044f3969c464b956776b04d63f85202b55ff500f66e516feca784a23293ba348"
   ]
  },
  {
   "name": "sha256:04712a39996925a168cba97cb0d85490265d6622fb321c4e2d1fb7c69c899fd9",
   "path": "rhel8/postgresql-12",
   "id": "sha256:04712a39996925a168cba97cb0d85490265d6622fb321c4e2d1fb7c69c899fd9",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:bdee7855ef43f1c1d40221634c315c1998e5ee6f976d77dec4834f669bee371d",
    "sha256:df8985aa78d66ad0ca1e65cdf78c0a770212de626074c34770d25b8dcfc5e4bf",
    "sha256:113d1f68e376ad7a3bf129e8f089da75d1fd7a2938edec3d1dc6811a5e00aa10",
    "sha256:acdf31f9936817dab4392a0f639cd3c0287345eb1ce89310f1008184955820a2",
    "sha256:6124c9bd7f4747247b8366b1b0a34cd1759d7755a59a1916e517a1ed1192ae3d"
   ]
  },
  {
   "name": "registry.redhat.io/rhel8/postgresql-12@sha256:be7212e938d1ef314a75aca070c28b6433cd0346704d0d3523c8ef403ff0c69e",
   "path": "rhel8/postgresql-12",
   "id": "sha256:be7212e938d1ef314a75aca070c28b6433cd0346704d0d3523c8ef403ff0c69e",
   "tagSymlink": "9262ff92",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:f5442fb0fdc59a61ae9ae2cc80307311c75901e358203363024bfec9d7459310",
    "sha256:1532f94a16f9f49d5f5c825f0b6ebe7a8d5d76ed9d25441b43a92b8b525dde0a",
    "sha256:abba41cd0355e95f5e5e557829c2fe0f55c096c495e8a524e5c6c99670ea7812",
    "sha256:04712a39996925a168cba97cb0d85490265d6622fb321c4e2d1fb7c69c899fd9"
   ]
  },
  {
   "name": "sha256:7ed62291f7d2dd79ea698e1b540f3fb9a74f207a7cdd2831faae75bc7f0561a9",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:7ed62291f7d2dd79ea698e1b540f3fb9a74f207a7cdd2831faae75bc7f0561a9",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55dd2c260a8e2457f9521fbec40af17444a24ff356afd64ccc1bc19d4042d2f9",
    "sha256:d8392fc061094fe2adab67d3c12c92a90049cfbed0ac7d07831f5d2cecbb223e",
    "sha256:3f0ca8e5b5b7946ef7a0248fbf440ce431ee900e7976b29912c2572562ded3d2",
    "sha256:976ba1ced065d7d541591561170e709b55975f029cc727717d648c45d83b8a8a"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:f2a27a9a9d70b92f8141ad64426eeb245a2eda7319a65f8652b109df66d9c8fe",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:f2a27a9a9d70b92f8141ad64426eeb245a2eda7319a65f8652b109df66d9c8fe",
   "tagSymlink": "54b1e4ef",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:fc500c69f5078d4f6ec65fed3354a44e479b39e9b1f552bcda2f1f90692f4072",
    "sha256:8c7450c98e8f82d3563ffde1e9466a86c8c4706ecd3f9ae63c0e78d028c4addc",
    "sha256:7ed62291f7d2dd79ea698e1b540f3fb9a74f207a7cdd2831faae75bc7f0561a9"
   ]
  },
  {
   "name": "sha256:fc500c69f5078d4f6ec65fed3354a44e479b39e9b1f552bcda2f1f90692f4072",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:fc500c69f5078d4f6ec65fed3354a44e479b39e9b1f552bcda2f1f90692f4072",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6963f872abface896838f7f855db3c316f6d9ded4aa57deae35c0600c8ecb61d",
    "sha256:3dbfdcfb8c042ca6f0e551c23a9fc7bc9083fafcdbe8edec3e142ece1b916a1d",
    "sha256:d9b909f23116cc7ca79900b835333b01118902921ab7e6fb4123ff6239ad573b",
    "sha256:9d3be1e9e43ea4703acf641d90655479e186f8aac66afd659026af9e0794b25a"
   ]
  },
  {
   "name": "sha256:8c7450c98e8f82d3563ffde1e9466a86c8c4706ecd3f9ae63c0e78d028c4addc",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:8c7450c98e8f82d3563ffde1e9466a86c8c4706ecd3f9ae63c0e78d028c4addc",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d4252c6bb465ad5289467cf894966a37b6b765e0251b346dd1cf928a187b3b44",
    "sha256:e0459927094ec1e61e3ff796c574696e0047d8ba9ad1c4826442c803525ea366",
    "sha256:b4adbc86ee2ef0fe30b7f743c02d134707641b9013e59b3cee1ca6e6e353e70a",
    "sha256:a59bf1dc1ad88170f0edef6f295bd4cf6fedb4bec8580f1e46d2d98aacad6536"
   ]
  },
  {
   "name": "sha256:c052ffa071d5680d1f3e4c29eb97c2ecb9c8ee4c33fb32e05e9608a3b731fec8",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:c052ffa071d5680d1f3e4c29eb97c2ecb9c8ee4c33fb32e05e9608a3b731fec8",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:55421525c6c3b6b3c9922e13a8c7ee45bb646e18f15dcda443d01da7942ad929",
    "sha256:d714b75d2c331c1143b2c269b173c6cacc0a7e04b57548f29a990c327fcaa532",
    "sha256:bcba8557624eec456700c8e900861d8b0833b3b1c8869514be650f34640c73e9",
    "sha256:5e371c6de53e806ba64300902b8a308b74fce12b9ce3555bbbfee10a96ab4494",
    "sha256:27b03e42f4d9c53d2d8b87cb74a9ab303f3e46d623e91ec31407b0d241997f75",
    "sha256:60319348cd8a351b06033fea5f474559866abe4ba320f7379f15c49c3921f157"
   ]
  },
  {
   "name": "sha256:b61836112c7b56c465766d1ec3040383d873526c46a4c52722ae79b72604b985",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:b61836112c7b56c465766d1ec3040383d873526c46a4c52722ae79b72604b985",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:6c63947448a0c6869f49acbbcd25a3e195f4b75b06124eeaf2583b03d4e68654",
    "sha256:74abdf4838109d801733a5b37bdea79b137e86509734df5152188684e79c8a6c",
    "sha256:8786189a4cb3ed9311aa3dbefb927bf05713fe04901d96e136b8b1560dd401cd",
    "sha256:a4425ab5446185efd3facd25ad5c7fc39d20f43fb9103c6a90055bd87a070cb8",
    "sha256:a1a0ac617d89a90f2731d0295f7ef37af2cf48f86db2a46de414f89a124c9f10",
    "sha256:d545f1bd674487339afeb825ce03af0af755a589698823e7e03fdfa2d46ae2a0"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:e61cb3f5c56771f94b6c80a99c644be560b1b5569d9fac7b5cc2860edb00e0b8",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:e61cb3f5c56771f94b6c80a99c644be560b1b5569d9fac7b5cc2860edb00e0b8",
   "tagSymlink": "b19a8494",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:cc5e8530139e7b2e32285c0efd16a43a551365705a69664d223370e00b85e80b",
    "sha256:c052ffa071d5680d1f3e4c29eb97c2ecb9c8ee4c33fb32e05e9608a3b731fec8",
    "sha256:b61836112c7b56c465766d1ec3040383d873526c46a4c52722ae79b72604b985"
   ]
  },
  {
   "name": "sha256:cc5e8530139e7b2e32285c0efd16a43a551365705a69664d223370e00b85e80b",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:cc5e8530139e7b2e32285c0efd16a43a551365705a69664d223370e00b85e80b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:a301327116a0e734fb34506202fafa3d0c94b4ec8f4e7e71a73d78c3a117419f",
    "sha256:81051d76ef8269de00d9e37d9aa57e88998c055c18d9a970233ffdb62785c960",
    "sha256:dae34b4e252ee42452b6bf54b0857049ca4115ef4dba7379e2cbd0815017fed8",
    "sha256:67d5efe70e06f58ab822b33cdfa89a8bd5bdc9f33d7fba86287752bc399520f6",
    "sha256:65220e141e4a6f97d3d8116b184ad63e6a055420fc3a45869451a0755f8fce16",
    "sha256:72f976b3c40f64f6e7fc49754b0ad0a4490e873d2427474729912f45e257ce1b"
   ]
  },
  {
   "name": "sha256:4557ce62ccc0f9762ce23a1970c9a5b90441361c7feabc8a50355349b961fd01",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:4557ce62ccc0f9762ce23a1970c9a5b90441361c7feabc8a50355349b961fd01",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:7472fa517fd188919c3ff6ec27806dd20311bb57e1e34a7f3998734688fa7b42",
    "sha256:9f6eca53e5bceb7b88b4c078cc5d939e61d13301d8bdccb6b68eeea4d3879f3e",
    "sha256:9a2bbe77a39ae999b29887d95f1b3bd5dfa19edc75b02b05a89e60d3fa059823",
    "sha256:b39ad9bca723c8ac86e739d746f854a3be0394f61b1a64d19ccd5f8543a2c744"
   ]
  },
  {
   "name": "sha256:e152564503077c3f0ccbe73572a1523be7cb2c0e8d5b294ade00e90553f6938d",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:e152564503077c3f0ccbe73572a1523be7cb2c0e8d5b294ade00e90553f6938d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:744db8e918c5c882f601488dcdbe3c4e9fa01913fe57119975eb5b16a18f6250",
    "sha256:d851aca55b090483dcda2af05dbf048848399647d96dd3d4089f92d35f827db7",
    "sha256:b88808630d432022586dd95d3f13c809a7847e97b63ec829933acda17029a493",
    "sha256:628587eea60cf36740c95479f583173b5ce2a053923c7eb888d2b57db635277c"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/ocs-must-gather-rhel8@sha256:65c4b98de58f052d1e2650fc356a3e828364b048289a38186564c95b1a5f7a85",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:65c4b98de58f052d1e2650fc356a3e828364b048289a38186564c95b1a5f7a85",
   "tagSymlink": "ed266c37",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:bdc3a345f5335516655df819a147335be5f030d72c8e65c9710ca44c284cd835",
    "sha256:4557ce62ccc0f9762ce23a1970c9a5b90441361c7feabc8a50355349b961fd01",
    "sha256:e152564503077c3f0ccbe73572a1523be7cb2c0e8d5b294ade00e90553f6938d"
   ]
  },
  {
   "name": "sha256:bdc3a345f5335516655df819a147335be5f030d72c8e65c9710ca44c284cd835",
   "path": "odf4/ocs-must-gather-rhel8",
   "id": "sha256:bdc3a345f5335516655df819a147335be5f030d72c8e65c9710ca44c284cd835",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0c673eb68f88b60abc0cba5ef8ddb9c256eaf627bfd49eb7e09a2369bb2e5db0",
    "sha256:028bdc977650c08fcf7a2bb4a7abefaead71ff8a84a55ed5940b6dbc7e466045",
    "sha256:9357605515b793a689a4dd667c15a2404e63c086e55639da8c8e881720096f10",
    "sha256:eac161fbca94bcae58951102856d6fff82530aa9eb71bac2e26ffc7c1fe36c50"
   ]
  },
  {
   "name": "sha256:35f3c4a2305acea0d9b6ea497ac2698090520e4bd29f8fa663b70046e502f8d6",
   "path": "openshift4/metallb-rhel8",
   "id": "sha256:35f3c4a2305acea0d9b6ea497ac2698090520e4bd29f8fa663b70046e502f8d6",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:237bfbffb5f297018ef21e92b8fede75d3ca63e2154236331ef2b2a9dd818a02",
    "sha256:39382676eb30fabb7a0616b064e142f6ef58d45216a9124e9358d14b12dedd65",
    "sha256:84fa853fc3c80a6beb3be70a9f7105f2a89dad0667e3abb45f3422beb48955b5",
    "sha256:850205e7bdb1dda587358268790dc316806dd767f7c26e2962d6cebd4ae6ed35",
    "sha256:5706327089a140a443cecc0e0dcf70527f35f77ef9eb3c2842f83f608e7e4d68"
   ]
  },
  {
   "name": "sha256:1978f5234e4b123a09e4488ea466c2b9ec94131615873e592216d4915d52616f",
   "path": "openshift4/metallb-rhel8",
   "id": "sha256:1978f5234e4b123a09e4488ea466c2b9ec94131615873e592216d4915d52616f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:57fce60a81bf84e6b61ce2b64643c9e4c61da77869b95e0641360b42429c0cff",
    "sha256:5e6920d5affe7a85fb62fffa4ff5285701d12f0a5777bbd21f32c0e789dd748a",
    "sha256:e09422f71c7ec104e4149ed5276c248bc0b3acc9966ed3a8daa64d1e79c0a4da",
    "sha256:2c0e8d86a294d29b355a5883c8f65896c5a1545cdd76c11db31ce6c0034bdcaf",
    "sha256:eb3597d533992eff9f4e4797e6e298814d23e8206c6da84ee90729815a83c4fd"
   ]
  },
  {
   "name": "sha256:ff2cffcd8ca137db7aa2316940ad4bd7be687543fd045dca50512663caf61859",
   "path": "openshift4/metallb-rhel8",
   "id": "sha256:ff2cffcd8ca137db7aa2316940ad4bd7be687543fd045dca50512663caf61859",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:b3bfb78b869da2ea75182a04179bb0cb2a737a34201dd9cd42f3ec128352223d",
    "sha256:f0696e2e6e881a72eb463f3df90a18bf158d0fa295714420091fe2f5beb2074d",
    "sha256:ecabd5a4d76e11c1471f268982e9b2b3f0eaba85af352348f82aa82ccaeb7a93",
    "sha256:d636ed61a8dffb303b46406e1a7d4ce090fd432f5a6d04db65316cadf56f1c9b",
    "sha256:d51f7d7a963be9db19ea223e9ab39a38be56e45af92b35664095905cb1ff76aa"
   ]
  },
  {
   "name": "sha256:adc5da00f5feb6bc3a717ca7c1f10c2fe95e6dbf96819aa3931aabc317aade1b",
   "path": "openshift4/metallb-rhel8",
   "id": "sha256:adc5da00f5feb6bc3a717ca7c1f10c2fe95e6dbf96819aa3931aabc317aade1b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4e164a8c5ac173c1683ca572e23b00962ef8ddd2db486762980f8d48117e4f8d",
    "sha256:9ab4182c2bfadf02e03bf6f92a366cd8d9e0e760abe30727538b54491201ac8c",
    "sha256:60524b5a39b91e4d71b2963b563b3e53b575e10d76cd7b0b1903ac839ed65b58",
    "sha256:76abd05e8d7b07d598d3ad8226f5618a3f6e870b7407d3ce1a8198e1374f09c3",
    "sha256:dac69fc3485eb7e4fb16b0721586934c17e53a4bdec8792e3d30096cbb639395"
   ]
  },
  {
   "name": "registry.redhat.io/openshift4/metallb-rhel8@sha256:90d2a8e89c878e242f87eaa68e73c63204c431127d33c813191ea5def8c598f5",
   "path": "openshift4/metallb-rhel8",
   "id": "sha256:90d2a8e89c878e242f87eaa68e73c63204c431127d33c813191ea5def8c598f5",
   "tagSymlink": "770d9131",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:35f3c4a2305acea0d9b6ea497ac2698090520e4bd29f8fa663b70046e502f8d6",
    "sha256:1978f5234e4b123a09e4488ea466c2b9ec94131615873e592216d4915d52616f",
    "sha256:ff2cffcd8ca137db7aa2316940ad4bd7be687543fd045dca50512663caf61859",
    "sha256:adc5da00f5feb6bc3a717ca7c1f10c2fe95e6dbf96819aa3931aabc317aade1b"
   ]
  },
  {
   "name": "sha256:1d01b70ebff07f3f3a66c997aae70325b0c240fe746e89973921e1cf7281a75b",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:1d01b70ebff07f3f3a66c997aae70325b0c240fe746e89973921e1cf7281a75b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:3296b73933545921c304eff356cace1fe59d9747470e8402dfffcc750a317551",
    "sha256:ac00ba95b735fa878b778cb49e9ff442ebdab61acc286a49d21c775a27055e2b"
   ]
  },
  {
   "name": "sha256:64a528108bca1701e77447ba87a344ada2d123ce980efc005e14abf8cd1d45a5",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:64a528108bca1701e77447ba87a344ada2d123ce980efc005e14abf8cd1d45a5",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:34a03469e7d1781c8ba532ae7a08fb76013ae7fbc6bec3253f4be449bb146885",
    "sha256:50985620b00e58c51ceba25a4bba7b6bbc96fa9026863d224b2a7de826ae0afe"
   ]
  },
  {
   "name": "sha256:c82f5eacb44a753cfcc0752660133a892f5123bf6dd75b2c87ce14f7fe7f32bf",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:c82f5eacb44a753cfcc0752660133a892f5123bf6dd75b2c87ce14f7fe7f32bf",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:e798dceb7ccc4ed400f18a61df47f9d7d224f1b0ba77fc7f7ac5d531a3c2eda1",
    "sha256:e53271995c2f16458d4eed9133d418c0a0eca4db0db3e012dc9f698a1d3d1253"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/volume-replication-rhel8-operator@sha256:ac97b59f8f5aa7e10730c0b43c8d94ebf344bb65b5f04ef864b3155fde11edf9",
   "path": "odf4/volume-replication-rhel8-operator",
   "id": "sha256:ac97b59f8f5aa7e10730c0b43c8d94ebf344bb65b5f04ef864b3155fde11edf9",
   "tagSymlink": "b82e370",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:1d01b70ebff07f3f3a66c997aae70325b0c240fe746e89973921e1cf7281a75b",
    "sha256:64a528108bca1701e77447ba87a344ada2d123ce980efc005e14abf8cd1d45a5",
    "sha256:c82f5eacb44a753cfcc0752660133a892f5123bf6dd75b2c87ce14f7fe7f32bf"
   ]
  },
  {
   "name": "sha256:c8fc3444b36626b826dd62f7ad45a0a4af2673b788858127920d8d534651a85f",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:c8fc3444b36626b826dd62f7ad45a0a4af2673b788858127920d8d534651a85f",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
    "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
    "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
    "sha256:03f28195da81fb472b0de7cbd0aa556ec83d2c9b69c91def562c8d7d8c8e2f74",
    "sha256:c47457eeebf0e8573449b5b0419f3df3a1c90d00f788e67ca4d85b85fb1b41fc"
   ]
  },
  {
   "name": "sha256:d0ba83b088e9bce552ca49ae02f5076563ba7c93718a307760b70c5a3ebc2e1a",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:d0ba83b088e9bce552ca49ae02f5076563ba7c93718a307760b70c5a3ebc2e1a",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
    "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
    "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
    "sha256:68f1149069d8db886176298713d2c37d798b69306b52d5e066db3f54d395ab0d",
    "sha256:34c0c6c8e22138e2d66e8635e77f5c13d7c1c758ffd659d73def463be880bed8"
   ]
  },
  {
   "name": "sha256:b760f319ed4a9ab09d2b01d9b8c9409c0e1f334e1aa9274efff844ae3e3230d2",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:b760f319ed4a9ab09d2b01d9b8c9409c0e1f334e1aa9274efff844ae3e3230d2",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
    "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
    "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
    "sha256:6474a192a0e0137957d6ec912ba1017f5d4137fa4f87d0fb68d676c7ccb6e3de",
    "sha256:98f095e8467608ae1ec16d62552e7ccb7ccceb8ad33bc4fdd9b0365f3474d797"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/cephcsi-rhel8@sha256:6e6a505d33ebe7a8a8c4b7b9235bbb34347224ccfdfb2cc927d3b93b730725e8",
   "path": "odf4/cephcsi-rhel8",
   "id": "sha256:6e6a505d33ebe7a8a8c4b7b9235bbb34347224ccfdfb2cc927d3b93b730725e8",
   "tagSymlink": "3939a5a",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:c8fc3444b36626b826dd62f7ad45a0a4af2673b788858127920d8d534651a85f",
    "sha256:d0ba83b088e9bce552ca49ae02f5076563ba7c93718a307760b70c5a3ebc2e1a",
    "sha256:b760f319ed4a9ab09d2b01d9b8c9409c0e1f334e1aa9274efff844ae3e3230d2"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/rook-ceph-rhel8-operator@sha256:fbb33bb93afdb1d668fcdde4ba53b57adc8629fabd92ef900956c14796035bbf",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:fbb33bb93afdb1d668fcdde4ba53b57adc8629fabd92ef900956c14796035bbf",
   "tagSymlink": "d0438cd9",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:3945dc8427c91efff2f32b99199da7f6dd202430e04a9868d52734d45701e61a",
    "sha256:348c35af68022a58948e2e55b761eed836a3e721857839ff9ad011fa767fa319",
    "sha256:71013b5b69ef2e68e64a7db5022184a0d7c3393d060a2c6b4648fb91ff34ba0b"
   ]
  },
  {
   "name": "sha256:3945dc8427c91efff2f32b99199da7f6dd202430e04a9868d52734d45701e61a",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:3945dc8427c91efff2f32b99199da7f6dd202430e04a9868d52734d45701e61a",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4eef1fa1f1c17f9ad6a8187dd5a483e11bd340fc116057bd4cece92305151072",
    "sha256:eb24191cef200934f4fe601f3dc7e7847ea86ce5c52cb9859361bf8e00fe95e7",
    "sha256:a3ed2ffc199153e7f69d04a8e193fb3fa496b50b010eef474c815ca756ba7b23",
    "sha256:c1422527836f5a0509c89cec9561682ce6d1d5590a756e94e0d57ecb6705338a",
    "sha256:a6af77c1b9f5262b90d37941671c2390408791a771e230cb9a16b873170975d0"
   ]
  },
  {
   "name": "sha256:348c35af68022a58948e2e55b761eed836a3e721857839ff9ad011fa767fa319",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:348c35af68022a58948e2e55b761eed836a3e721857839ff9ad011fa767fa319",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:0c044540be4942469c720b6f7236ef4e73eec18e16f460b9d6a47cca9e9c659a",
    "sha256:f34c2d434023cf6d23aa265c497534020b07992944c80042c4b38724ddd19943",
    "sha256:c5cd77101589342a2daf9a80974c8827b10def5e774047dd5f8f6dec9d591c2b",
    "sha256:88134a30f8f33bbc424e2a97b36a0ef3d4293556b78ac7f36a79ecb7a7488e10",
    "sha256:8a120ac25823a6c55fe6e63e0ddef8c9bb4ec57b1ceed743216d0e163c8b4eed"
   ]
  },
  {
   "name": "sha256:71013b5b69ef2e68e64a7db5022184a0d7c3393d060a2c6b4648fb91ff34ba0b",
   "path": "odf4/rook-ceph-rhel8-operator",
   "id": "sha256:71013b5b69ef2e68e64a7db5022184a0d7c3393d060a2c6b4648fb91ff34ba0b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:92444883c1ae32f4cc6a9a9d7f8da376c656b9f09e68b4734877730c3b162806",
    "sha256:ac2beb4dac930fe10977b73e592e88c824ea72cf3aa12f1ee1c0cc93336b3ba2",
    "sha256:4f44f8c3331e7e71889cbcadd8aec0d0644c678cd4cb02db13035479aab4484f",
    "sha256:1379955babc729cfcae73db8dbb9eb1b5107bcbc50ebc1730e7fff9007f1124b",
    "sha256:862dd7a55e887984f0cfc6f816f7f97fcab354a3586eb2bca7065d840968db2d"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-operator-bundle@sha256:0651850ea45cad985998ede7e625e22ae3ffc50442142fbe49eef558cffc81a0",
   "path": "odf4/odf-operator-bundle",
   "id": "sha256:0651850ea45cad985998ede7e625e22ae3ffc50442142fbe49eef558cffc81a0",
   "tagSymlink": "46737fef",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:17d51871f0c4c1a06d7622c073147cf4cbec945b385e36d387be02e2a8dbaaff",
    "sha256:efadf00181bc668257220b3b433cfeae5d7e20084cd6b2c407d8b1847a178a7b"
   ]
  },
  {
   "name": "sha256:946749ba48c473467aacae977de10d5daf0a30fea1434af6af8718ea39f3675c",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:946749ba48c473467aacae977de10d5daf0a30fea1434af6af8718ea39f3675c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:0c1fd83997e17b079085107d40f89cea2211f9ec3db88d5241019a85d06db5a7",
    "sha256:e76fbc91af5d560232191ef55c8366dcc52e0f8d4ddf97ba6140329787db6c39",
    "sha256:ca31dba25a30991a1458a32b511c542d93e4d06be8ce0004758b34c95d8bbefe",
    "sha256:7ea49f984feb11fd2d9ac8fb630d0546d68df1aa6f5561b2737ec32abaf6d9b3"
   ]
  },
  {
   "name": "sha256:45c28f91d0063c8ed9c9810b45e16f69825e07e824f3d9262cf1119914fc10a1",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:45c28f91d0063c8ed9c9810b45e16f69825e07e824f3d9262cf1119914fc10a1",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:d2be686e74da7c701311c471acf80b269afb9a3165314de5aa2b9a6df6562fd7",
    "sha256:98a3f59d1db45f44899db07a0f1cbc3525c9e1cfa91805892ecabbe31ee7a769",
    "sha256:865cfdacf254247870a230b8e5f527ebfc318fe7ad3979663ddb4ea39ce95988",
    "sha256:7c442469df1896c1f2a2e0ca4b37824f7001ff9015e7665df265b7d444a7e3b3"
   ]
  },
  {
   "name": "sha256:8c80b3ac044018512283fc03419eac5e12654f8b855333b16a63522b5f62b507",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:8c80b3ac044018512283fc03419eac5e12654f8b855333b16a63522b5f62b507",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:da6cf90000f1e8c68029513a3674919c4c460ed472ba88ccbaa046c74ddcc951",
    "sha256:92c3cd1997868b9ccce823c559765bc77f5bbc8ad061d6a81d382c568a21fb58",
    "sha256:8b327b4fbce925c4c8f970e8416dd6bfc11acd0de23c616bb719ef77e84b9f0c",
    "sha256:7f2d8c36f2242504b22164200c7a66ae3a5fdc8e9bd91f556767f282008eabd1"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-console-rhel8@sha256:65167c53c27c19f5d35961b71e61c6fe0d6f35f8a03ad1d79937f3109f3c416a",
   "path": "odf4/odf-console-rhel8",
   "id": "sha256:65167c53c27c19f5d35961b71e61c6fe0d6f35f8a03ad1d79937f3109f3c416a",
   "tagSymlink": "ba2b5ff",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:946749ba48c473467aacae977de10d5daf0a30fea1434af6af8718ea39f3675c",
    "sha256:45c28f91d0063c8ed9c9810b45e16f69825e07e824f3d9262cf1119914fc10a1",
    "sha256:8c80b3ac044018512283fc03419eac5e12654f8b855333b16a63522b5f62b507"
   ]
  },
  {
   "name": "registry.redhat.io/rhceph/rhceph-5-rhel8@sha256:fc25524ccb0ea78526257778ab54bfb1a25772b75fcc97df98eb06a0e67e1bf6",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:fc25524ccb0ea78526257778ab54bfb1a25772b75fcc97df98eb06a0e67e1bf6",
   "tagSymlink": "940f0024",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:06255c43a5ccaec516969637a39d500a0354da26127779b5ee53dbe9c444339c",
    "sha256:a500ebe5a174a9fb1888866ece82a76c5f586fa058a045315aaa4e8943e10573",
    "sha256:abeb1f371d18b55380ef5661fbf86dde78f7b84da41516feff679866c8164d6c"
   ]
  },
  {
   "name": "sha256:06255c43a5ccaec516969637a39d500a0354da26127779b5ee53dbe9c444339c",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:06255c43a5ccaec516969637a39d500a0354da26127779b5ee53dbe9c444339c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:1b890c73c3cf60b04334fded9e3edc647d64dd39ffd078317e2bd69552a2fd1d",
    "sha256:de63ba066b7c0c23e2434efebcda7800d50d60f33803af9c500f75a69fb76ffa",
    "sha256:b2a723a1165850255e84a64214f06e6adb9ff3f3290e0b35132313684af7b621",
    "sha256:a4eb511aa22b894560dd7f213a67563962331bf38dae266b877de5640db79838"
   ]
  },
  {
   "name": "sha256:a500ebe5a174a9fb1888866ece82a76c5f586fa058a045315aaa4e8943e10573",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:a500ebe5a174a9fb1888866ece82a76c5f586fa058a045315aaa4e8943e10573",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:9f78280d50082c329e73123d73b3debc7f5eec007d8a0c7b1d388ff69b9652fc",
    "sha256:a1a64b9c0d1a2a468c65bf81fb26d51416a3e19d95d08df39e5d7d012a25b685",
    "sha256:f7109c3dbacb07ae738be8afb80c1d580757c61c03ec5e18ef2fa600b7823d26",
    "sha256:22e7d2b52122cbb2c8b1a4374d1b7d71d1d34b603a58983de0dc0539b6625ed6"
   ]
  },
  {
   "name": "sha256:abeb1f371d18b55380ef5661fbf86dde78f7b84da41516feff679866c8164d6c",
   "path": "rhceph/rhceph-5-rhel8",
   "id": "sha256:abeb1f371d18b55380ef5661fbf86dde78f7b84da41516feff679866c8164d6c",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4f639942cb5a04cfde9e90ad4590927d87ec970f46186ebe46182c2f0657584d",
    "sha256:261c17695cc21090e4719a05e282f024f0ab9a36997b3e3550ee7a97dee98668",
    "sha256:aa345f2f6695ebc5e00997e8487c157fd9669cc8cfcb7dfabe3b00bb7ae5a4f4",
    "sha256:872387e48a2788b3053afda8a95fe6469435091b2182e6ef1d59c7e6c50b01cf"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-rhel8-operator@sha256:704398c98def956a4b4fd6cc09fb9367d706f8f7a05bdc66152c6d57325d7610",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:704398c98def956a4b4fd6cc09fb9367d706f8f7a05bdc66152c6d57325d7610",
   "tagSymlink": "5e73383d",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:ea0301b009f62b9126f07dddd2a71b9b84520a6d9c8d888104f8220203933065",
    "sha256:ab47be2ad30f11041ccc122fa3352e931b35aa19876415011d9a3cc3069aeef4",
    "sha256:b36bcaf2817da2413abf65027de3b5bf3b6997c754d7348776dd04f353e1e837"
   ]
  },
  {
   "name": "sha256:ea0301b009f62b9126f07dddd2a71b9b84520a6d9c8d888104f8220203933065",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:ea0301b009f62b9126f07dddd2a71b9b84520a6d9c8d888104f8220203933065",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:d3b9a4a690bf1791b874c3495c6a8e2c039150b5882374cd9c42dd4bba68ba31",
    "sha256:a049ed70eeb87542c711449e14b6a7ccdde9ca2219d749fa0872aa755f2a89cb",
    "sha256:756d7839fb0ad8eafac7f819c3f6d41a11407e0df3e24653275fe0c6ed5b04ad",
    "sha256:778bca37cfc4fac0153a14753d1857c42fe9affc9f9c93c98626425ffd39974e"
   ]
  },
  {
   "name": "sha256:ab47be2ad30f11041ccc122fa3352e931b35aa19876415011d9a3cc3069aeef4",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:ab47be2ad30f11041ccc122fa3352e931b35aa19876415011d9a3cc3069aeef4",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:02863a09124c1837ee0672a011fb7e2d5c95ae16af6b569f65d2e0f763127ddc",
    "sha256:97aead8e17dadf7e07e5153ee6d5a68d28e46847e01db6d9325742076043fd20",
    "sha256:7445b6eacd6ae3c33281f3e2347bf507c0dd699155050814b8a45abd7dd319ed",
    "sha256:48dd514b99f4eb649d2467abef1cd8b7f24ea5dc4e46df5b75732c033a6e6c93"
   ]
  },
  {
   "name": "sha256:b36bcaf2817da2413abf65027de3b5bf3b6997c754d7348776dd04f353e1e837",
   "path": "odf4/mcg-rhel8-operator",
   "id": "sha256:b36bcaf2817da2413abf65027de3b5bf3b6997c754d7348776dd04f353e1e837",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:220d447748c8866cbfeac8fb3534dd8d49cc8b99cc625041414c17d0f80e02ca",
    "sha256:8909629d32e7d0fef085a5fcee0e0f318367006d81be0d5da8e0a209ee230793",
    "sha256:c8aed4fc98f7d3c47b1730eda20691e77bba5ae5510cbffd30ce7859836f86d8",
    "sha256:d4e9217cde6a0314a8296b37d62dbe1fae21196f940903153e29bf30262ee610"
   ]
  },
  {
   "name": "sha256:7f1ef78c8e86c593a29f5a263fe2db2956e200107e9c557195dd1b1d58555faa",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:7f1ef78c8e86c593a29f5a263fe2db2956e200107e9c557195dd1b1d58555faa",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:4752687a61a97d6f352ae62c381c87564bcb2f5b6523a05510ca1fb60d640216",
    "sha256:0344366a246a0f7590c2bae4536c01f15f20c6d802b4654ce96ac81047bc23f3",
    "sha256:3a5af6a324bed0e44edfbb9045ab4242b4bbaf5403cdcc47191f76dff74a7df8",
    "sha256:30f94741512b7c0f4e6214528d7f2a3d65db3c3d24051d711e20eee49ed34a13"
   ]
  },
  {
   "name": "sha256:2425aef3fa33c5d4820c28435dd00f1b0575e7076d7b6ecd35bb2f5f7dceaa6d",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:2425aef3fa33c5d4820c28435dd00f1b0575e7076d7b6ecd35bb2f5f7dceaa6d",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:014fade9a1e0bd2ed8d6ebc7c7bc1c1521dc1ab3b360bf457f8e33d1a631d20c",
    "sha256:f284eae9a3640ce69ff6b6389f40be495f73321a66bcc48eca7100dd84e4a599",
    "sha256:21a2c2b0eb50dd4f55567d1c384282e6ee3225b65b69067b01704cd5dc739819",
    "sha256:9623c55c585ee828435b1c4f165062e42f51d859a78c3eca1a8fa852f5bf2ecb"
   ]
  },
  {
   "name": "sha256:7bf61fbb923a11ed806e4c2403189b4a22f6f3d38869334d160c78da3db72da3",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:7bf61fbb923a11ed806e4c2403189b4a22f6f3d38869334d160c78da3db72da3",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:396d1a557919e04387b8be3cb3821a4074b9ec59669aec73267a3c2d0ff9cf48",
    "sha256:0c2466aacfac632801665d882ac94d3319b49abbe38f7f3611888faed93bb257",
    "sha256:a5795d7f520573b30b9f938d64f50387a525a4ab49846d85aaba6f1df484238e",
    "sha256:3db9098009e0eed80f5b1d8149883956c2daded3b07df340f9b1ec1e847d0700"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/odf-rhel8-operator@sha256:9e3fa922c7d390a2c897964e72f01a3656214c60aa9c6f93a1bde41aacd9a7c5",
   "path": "odf4/odf-rhel8-operator",
   "id": "sha256:9e3fa922c7d390a2c897964e72f01a3656214c60aa9c6f93a1bde41aacd9a7c5",
   "tagSymlink": "88d21732",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:7f1ef78c8e86c593a29f5a263fe2db2956e200107e9c557195dd1b1d58555faa",
    "sha256:2425aef3fa33c5d4820c28435dd00f1b0575e7076d7b6ecd35bb2f5f7dceaa6d",
    "sha256:7bf61fbb923a11ed806e4c2403189b4a22f6f3d38869334d160c78da3db72da3"
   ]
  },
  {
   "name": "sha256:d16ddaa0ad8cbcc8b4dbece29779a8fcefa7b18ec4e6ccdbfa0cd374ccb5f592",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:d16ddaa0ad8cbcc8b4dbece29779a8fcefa7b18ec4e6ccdbfa0cd374ccb5f592",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:f70d60810c69edad990aaf0977a87c6d2bcc9cd52904fa6825f08507a9b6e7bc",
    "sha256:545277d800059b32cf03377a9301094e9ac8aa4bb42d809766d7355ca9aa8652",
    "sha256:c4e8dd83aa6fbb4f16a96651133f0045346d7c27be55fa2f30e95b3819a27597",
    "sha256:5e981ffaf446f31de66d26202336a0148a86ac5b5f94509507c106d2d7b058f7"
   ]
  },
  {
   "name": "sha256:38d153287be86f706708535a296df8fa8493371f29dbed91a5e2849bd7ffc903",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:38d153287be86f706708535a296df8fa8493371f29dbed91a5e2849bd7ffc903",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:3535894aee571461a1e349f56efc71bd16510bb12c5893003f15aef9f272bc8e",
    "sha256:0a1c03975291cb2c4122f9a829d1747a3cf4a20e84b3cb01d4edf574201a1495",
    "sha256:6a003ca6c746424a0a402f7dd38b9c0580a777d271908662025a4e567776cd72",
    "sha256:2c57b5b4658eb714755984871031648fa0a11f2a462db90c2c0994162c75afe4"
   ]
  },
  {
   "name": "sha256:f0573f468343e29db8cea708332c1f35be912f5c71afc2ed030f9057c99d8c9b",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:f0573f468343e29db8cea708332c1f35be912f5c71afc2ed030f9057c99d8c9b",
   "tagSymlink": "",
   "type": "operatorBundle",
   "layerDigests": [
    "sha256:e8d8cab5ec852ea3c5242b9727d32f9def59ec60c596fd0cf1693e17a8e1fc2c",
    "sha256:fa7d3d3fed5d2fc0d5c4b1cb4c1111b2ddb338b467c6d28bec0d7c0f2be2eee5",
    "sha256:f43de919108993052d3c3cd786ea713b7fbade1fd6e9f62b971f5245a8dc00fd",
    "sha256:beab3ada94eaec6c2a0f3e24cab4148d716bad8638e96c19991791c1c0664d0d"
   ]
  },
  {
   "name": "registry.redhat.io/odf4/mcg-core-rhel8@sha256:80897f0ac2df4039b98cfda43118d2b00f4ccef9a9495e733dfaab75ab1ecfb0",
   "path": "odf4/mcg-core-rhel8",
   "id": "sha256:80897f0ac2df4039b98cfda43118d2b00f4ccef9a9495e733dfaab75ab1ecfb0",
   "tagSymlink": "ea90b48f",
   "type": "operatorBundle",
   "manifestDigests": [
    "sha256:d16ddaa0ad8cbcc8b4dbece29779a8fcefa7b18ec4e6ccdbfa0cd374ccb5f592",
    "sha256:38d153287be86f706708535a296df8fa8493371f29dbed91a5e2849bd7ffc903",
    "sha256:f0573f468343e29db8cea708332c1f35be912f5c71afc2ed030f9057c99d8c9b"
   ]
  }
 ]
}
{% endhighlight %}
</details>