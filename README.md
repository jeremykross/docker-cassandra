docker-cassandra
==============

##About

###Description
Docker image designed to run a Cassandra cluster on ContainerShip

###Author
ContainerShip Developers - developers@containership.io

##Usage
This image is designed to run cassandra on a ContainerShip cluster. Running this image elsewhere is not recommended as the container will likely be unable to start.

###Configuration
This image will run as-is, with no additional environment variables set. For clustering to work properly, start the application in host networking mode. Setting the `CASSANDRA_CLUSTER_NAME` environment variable will rename your cluster.

### Recommendations
* On your ContainerShip cluster, run this application using the `constraints.per_node=1` tag. Each node in your cluster will run an instance of cassandra, creating a cluster of `n` nodes, where `n` is the number of follower nodes in your ContainerShip cluster.
* Start the application with `container_volume=/mnt/cassandra` and `host_volume=/var/lib/cassandra/data` so data is persisted to the host system in case your container crashes. Additionally, by bind-mounting the volume, your data will be available for backup from ContainerShip Cloud.

##Contributing
Pull requests and issues are encouraged!
