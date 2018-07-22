const EventEmitter = require('events');

const memjs = require('memjs');
const pify = require('pify');

class KeyvMemjs extends EventEmitter {
  constructor(hosts, options) {
    super();

    if (typeof hosts === 'string') {
      const m = /^memjs:\/\/(.+)/.exec(hosts);
      if (m) {
        hosts = m[1];
      }
    }

    options = Object.assign(
      {},
      (typeof hosts === 'string') ? { hosts: hosts } : hosts,
      options
    );

    if (!options.client) {
      if (!options.hosts) {
        options.hosts = '127.0.0.1:11211';
      }

      if (Array.isArray(options.hosts)) {
        options.hosts = options.hosts.join(',');
      }

      options.client = memjs.Client.create(options.hosts, options);
    }

    const client = options.client;

    this.client = ['get', 'set', 'delete', 'flush'].reduce((obj, method) => {
      obj[method] = pify(client[method].bind(client));
      return obj;
    }, {});

    client.stats(err => {
      if (err) {
        this.emit('error', err);
      }
    });
  }

  get(key) {
    return this.client.get(key).then(value => {
      if (value === null) {
        return undefined;
      }
      return value.toString();
    });
  }

  set(key, value, ttl) {
    if (typeof value === 'undefined') {
      return Promise.resolve(undefined);
    }

    let expires = null;
    if (typeof ttl === 'number') {
      expires = Math.ceil(ttl / 1000);
    }

    return this.client.set(key, value, {expires});
  }

  delete(key) {
    return this.client.delete(key);
  }

  clear() {
    return this.client.flush().then(() => undefined);
  }
}

module.exports = KeyvMemjs;