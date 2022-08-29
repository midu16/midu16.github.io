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
<summary>grpcurl -plaintext INBACRNRDL0100.offline.oxtechnix.lan:50051 api.Registry/ListPackages</summary>
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

