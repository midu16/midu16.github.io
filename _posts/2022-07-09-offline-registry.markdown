---
layout: post
title:  "Offline registry for Openshift 4!"
date:   2022-07-09 12:30:29 +0200
categories: openshift4
---
In the following post, we are going to talk about creating an offline container base registry.

Prerequisites

- Linux Operating System ( in the further steps example of this post, we are going to use Fedora Linux 36 (Workstation Edition) ).
- The host should have internet connectivity

Offiline registry

Step 1. Installing `podman`

{% highlight ruby %}
 sudo dnf -y install podman 
{% endhighlight %}

For other type of Linux Operating System check the [Podman docs][podman-doc] for the right command.

Step 2. Creating the `application directory` of the offline registry

{% highlight ruby %}
 mkdir -p /apps/registry/{auth,certs,data}
{% endhighlight %}

Step 3. Installing the `htpasswd`

{% highlight ruby %}
 sudo dnf -y install httpd-tools
{% endhighlight %}

Step 4. Creating the `username:password` of the offline registry

{% highlight ruby %}
 htpasswd -bBc /apps/registry/auth/htpasswd <username> <password>
{% endhighlight %}

Note, that the <username> and <password> should be replaced with the values you are going to use for your environment.

Step 5. Creating the offline self-signed certificate.

{% highlight ruby %}
 openssl req -newkey rsa:4096 -nodes -sha256 -keyout /apps/registry/certs/domain.key -x509 -days 356 -out /apps/registry/certs/domain.crt -addext "subjectAltName = INBACRNRDL0100.offline.oxtechnix.lan"
 sudo cp /apps/registry/certs/domain.crt /etc/pki/ca-trust/source/anchors/
 sudo update-ca-trust
{% endhighlight %}

In order to validate the trust certificats use the following command

{% highlight ruby %}
 sudo trust list | grep -i "registry"
{% endhighlight %}

Step 6. Creating the registry container

{% highlight ruby %}
 podman run -d --name ocpdiscon-registry -p 5000:5000 \
-e REGISTRY_AUTH=htpasswd \
-e REGISTRY_AUTH_HTPASSWD_REALM=Registry \
-e REGISTRY_HTTP_SECRET=ALongRandomSecretForRegistry \
-e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
-e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
-e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
-e REGISTRY_COMPATIBILITY_SCHEMA1_ENABLED=true \
-e REGISTRY_STORAGE_DELETE_ENABLED=true \
-v /apps/registry/data:/var/lib/registry:z \
-v /apps/registry/auth:/auth:z \
-v /apps/registry/certs:/certs:z docker.io/library/registry:2.8.1
{% endhighlight %}

Step 7. Make sure that the firewall is having the port `5000` open

{% highlight ruby %}
 sudo firewall-cmd --add-port=5000/tcp --zone=internal --permanent
 sudo firewall-cmd --add-port=5000/tcp --zone=public --permanent
 sudo firewall-cmd --reload
{% endhighlight %}

Step 8. Manage the `ocpdiscon-registry` container with systemd

{% highlight ruby %}
 mkdir -p ${HOME}/.config/systemd/user/
 cd ${HOME}/.config/systemd/user/
 podman generate systemd --new --files --name ocpdiscon-registry
 systemctl --user daemon-reload
 systemctl --user start ocpdiscon-registry.service
 systemctl --user is-active ocpdiscon-registry.service
 cd ${HOME}
{% endhighlight %}

Step 9. Download the `openshift-cli-client`

Go to the [Download Openshift CLI for linux][openshift-cli-linux] to download the `oc-cli-client` for linux.

{% highlight ruby %}
 tar xvf ${HOME}/Downloads/oc-4.10.21-linux.tar.gz
 cp ${HOME}/Downloads/oc-4.10.21-linux/oc /usr/local/bin/oc
 cp ${HOME}/Downloads/oc-4.10.21-linux/kubectl /usr/local/bin/kubectl
{% endhighlight %}

Step 10. Download the `pull-secret` 

Go to the [Download Openshift pull-secret][openshift-pull-secret] to download the pull-secret file. Once you obtain the file check the following command to  

Step 11. Modifying `pull-secret` file for offline-registry use

{% highlight ruby %}
 cat ${HOME}/Downloads/pull-secret | jq . > /apps/registry/pull-secret.json
{% endhighlight %}

The following `/apps/registry/pull-secret.json` content would follow the following template:
{% highlight ruby %}
{
  "auths": {
    "cloud.openshift.com": {
      "auth": "b3BlbnNo...",
      "email": "you@example.com"
    },
    "quay.io": {
      "auth": "b3BlbnNo...",
      "email": "you@example.com"
    },
    "registry.connect.redhat.com": {
      "auth": "NTE3Njg5Nj...",
      "email": "you@example.com"
    },
    "registry.redhat.io": {
      "auth": "NTE3Njg5Nj...",
      "email": "you@example.com"
    }
  }
}
{% endhighlight %}
Now we should add the section that describes the credentials to the offline registry:
{% highlight ruby %}
"auths": {
    "<mirror_registry>": { 
      "auth": "<credentials>", 
      "email": "you@example.com"
  },
{% endhighlight %}
In the end the `pull-secret.json` should follow the following template:
{% highlight ruby %}
{
  "auths": {
    "cloud.openshift.com": {
      "auth": "b3BlbnNo...",
      "email": "you@example.com"
    },
    "quay.io": {
      "auth": "b3BlbnNo...",
      "email": "you@example.com"
    },
    "registry.connect.redhat.com": {
      "auth": "NTE3Njg5Nj...",
      "email": "you@example.com"
    },
    "registry.redhat.io": {
      "auth": "NTE3Njg5Nj...",
      "email": "you@example.com"
    },
    "<mirror_registry>": {
      "auth": "<credentials>",
      "email": "you@example.com"
    }
  }
}

{% endhighlight %}

Step 12. Login to the offline registry

{% highlight ruby %}
 podman login --authfile pull-secret.json -u <username> -p <password> INBACRNRDL0100.offline.oxtechnix.lan:5000
 Login Succeeded!
{% endhighlight %}

Step 13. Mirroring OCP container base images to the offline registry

{% highlight ruby %}
 export UPSTREAM_REPO=quay.io/openshift-release-dev/ocp-release@sha256:e9bcc5d74c4d6651f15601392e7eec52a9feacbf583ca5323ddeb9d3a878d75d
 export host_fqdn=$(hostname -f)
 export LOCAL_REG="${host_fqdn}:5000"
 export LOCAL_REPO="ocp-release"
 export VERSION="4.8.45-x86_64"
 export PULLSECRET_FILE=/apps/registry/pull-secret.json
 oc adm release mirror -a ${PULLSECRET_FILE} --from=$UPSTREAM_REPO --to-release-image=$LOCAL_REG/$LOCAL_REPO:${VERSION} --to=$LOCAL_REG/$LOCAL_REPO --apply-release-image-signature
{% endhighlight %}

Step 14. ICSP.yaml and install-config.yaml

Once the container base image mirroring will be finished, you will be promt with the following message:

To use the new mirrored repository to install, add the following section to the install-config.yaml:

{% highlight ruby %}
imageContentSources:
- mirrors:
  - INBACRNRDL0100.offline.oxtechnix.lan:5000/ocp-release
  source: quay.io/openshift-release-dev/ocp-release
- mirrors:
  - INBACRNRDL0100.offline.oxtechnix.lan:5000/ocp-release
  source: quay.io/openshift-release-dev/ocp-v4.0-art-dev


To use the new mirrored repository for upgrades, use the following to create an ImageContentSourcePolicy:

apiVersion: operator.openshift.io/v1alpha1
kind: ImageContentSourcePolicy
metadata:
  name: example
spec:
  repositoryDigestMirrors:
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/ocp-release
    source: quay.io/openshift-release-dev/ocp-release
  - mirrors:
    - INBACRNRDL0100.offline.oxtechnix.lan:5000/ocp-release
    source: quay.io/openshift-release-dev/ocp-v4.0-art-dev
{% endhighlight %}
 
Save this information for later use. For more information you can check [Openshift Documentation][openshift-doc].

Step 15. Validating the mirroring 

{% highlight ruby %}
 curl --user <username>:<password> https://INBACRNRDL0100.offline.oxtechnix.lan:5000/v2/_catalog 
{"repositories":["ocp-release"]}
{% endhighlight %}


[openshift-doc]: https://docs.openshift.com/container-platform/4.8/installing/installing-mirroring-installation-images.html
[openshift-cli-linux]:   https://access.redhat.com/downloads/content/290
[openshift-pull-secret]: https://console.redhat.com/openshift/install/pull-secret
[podman-doc]: https://podman.io/getting-started/installation


Automating the Offline registry creation with Ansible

The following ansible tasks are preparing the environment from Step 1. to Step 6:

{% highlight ruby %}
---
- name: Install required packages
  dnf:
    name: podman
    state: latest

- name: Creating the working directory of the offline registry
  file:
    path: "{{item}}"
    state: directory
    owner: "{{ocp_username}}" 
    group: "{{ocp_group}}" 
    mode: 0640
  loop:
     - "/apps/registry/auth"
     - "/apps/registry/certs"
     - "/apps/registry/data"

- name: Add a user to a password file and ensure permissions are set
  htpasswd:
    path: /apps/registry/auth/htpasswd
    name: "{{ registry_username }}"
    password: "{{ registry_password }}"
    owner: "{{ ocp_username }}"
    group:  "{{ ocp_group }}"
    mode: 0640

- name: Generate an OpenSSL private key
  openssl_privatekey:
    path: "/apps/registry/certs/domain.key"
    size: "{{ key_size }}"
    type: "{{ key_type }}"
    backup: yes
- name: Generate an OpenSSL Certificate Signing Request with Subject information
  openssl_csr:
    path: "/apps/registry/certs/domain.csr"
    privatekey_path: "/apps/registry/certs/domain.key"
    country_name: "{{ country_name }}"
    organization_name: "{{ organization_name }}"
    email_address: "{{ email_address }}"
    common_name: "{{ server_hostname }}"

- name: Creating the user system directory of the offline registry
  file:
    path: "/home/{{ocp_username}}/.config/systemd/user/"
    state: directory
    owner: "{{ ocp_username }}" 
    group: "{{ ocp_group }}" 
    mode: 0640

- name: Creating the registry container
  podman_container:
    name: ocpdiscon-registry
    image: docker.io/library/registry:2.8.1
    state: started
    restart: yes
    restart_policy: "no"
    volume: 
        - "/apps/registry/data:/var/lib/registry:z"
        - "/apps/registry/auth:/auth:z"
        - "/apps/registry/certs:/certs:z"
    ports:
        - "5000:5000"
    env:
        REGISTRY_AUTH: "htpasswd"
        REGISTRY_AUTH_HTPASSWD_REALM: "Registry"
        REGISTRY_HTTP_SECRET: "ALongRandomSecretForRegistry"
        REGISTRY_AUTH_HTPASSWD_PATH: "/auth/htpasswd" 
        REGISTRY_HTTP_TLS_CERTIFICATE: "/certs/domain.crt"
        REGISTRY_HTTP_TLS_KEY: "/certs/domain.key"
        REGISTRY_COMPATIBILITY_SCHEMA1_ENABLED: "true"
        REGISTRY_STORAGE_DELETE_ENABLED: "true" 
    generate_systemd:
        path: "/home/{{ocp_username}}/.config/systemd/user/"
        restart_policy: always
        time: 120
        names: true
{% endhighlight %} 