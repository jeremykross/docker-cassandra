var fs = require("fs");
var os = require("os");
var _ = require("lodash");
var async = require("async");
var dns = require("native-dns");
var child_process = require("child_process");

async.parallel({
    listen_address: function(fn){
        var question = dns.Question({
          name: [os.hostname(), process.env.CS_CLUSTER_ID, "containership"].join("."),
          type: "A"
        });

        var req = dns.Request({
            question: question,
            server: { address: "127.0.0.1", port: 53, type: "udp" },
            timeout: 2000
        });

        req.on("timeout", function(){
            return fn(null, "127.0.0.1");
        });

        req.on("message", function (err, answer) {
            var addresses = [];
            answer.answer.forEach(function(a){
                addresses.push(a.address);
            });

            return fn(null, addresses.join(","));
        });

        req.send();
    },
    seeds: function(fn){
        var question = dns.Question({
          name: ["followers", process.env.CS_CLUSTER_ID, "containership"].join("."),
          type: "A"
        });

        var req = dns.Request({
            question: question,
            server: { address: "127.0.0.1", port: 53, type: "udp" },
            timeout: 2000
        });

        req.on("timeout", function(){
            return fn();
        });

        req.on("message", function (err, answer) {
            var addresses = [];
            answer.answer.forEach(function(a){
                addresses.push(a.address);
            });

            addresses = addresses.join(",");

            if(_.isEmpty(addresses))
                addresses = undefined;

            return fn(null, addresses);
        });

        req.send();
    },
    cluster_name: function(fn){
        return fn(null, process.env.CASSANDRA_CLUSTER_NAME);
    }
}, function(err, cassandra){
    _.defaults(cassandra, {
        rpc_address: "0.0.0.0",
        listen_address: "127.0.0.1",
        seeds: "127.0.0.1",
        cluster_name: "ContainerShip Cassandra"
    });

    cassandra.broadcast_address = cassandra.listen_address;

    fs.readFile([__dirname, "cassandra.template"].join("/"), function(err, config){
        config = config.toString();
        config = config.replace(/LISTEN_ADDRESS/g, cassandra.listen_address);
        config = config.replace(/BROADCAST_ADDRESS/g, cassandra.broadcast_address);
        config = config.replace(/BROADCAST_RPC_ADDRESS/g, cassandra.broadcast_address);
        config = config.replace(/RPC_ADDRESS/g, cassandra.rpc_address);
        config = config.replace(/SEEDS/g, cassandra.seeds);
        config = config.replace(/CLUSTER_NAME/g, cassandra.cluster_name);

        fs.writeFile(process.env.CASSANDRA_CONFIG, config, function(err){
            if(err)
                process.exit(1);

            child_process.spawn("cassandra", [ "-f" ], {
                stdio: "inherit"
            }).on("error", function(err){
                process.stderr.write(err);
            });
        });
    });
});
