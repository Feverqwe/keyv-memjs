const EventEmitter = require('events');

const memjs = require('memjs');
const pify = require('pify');

const oneDay = 86400 * 1000;

class KeyvMemjs extends EventEmitter {
  constructor(hosts, options) {
    super();

    options = Object.assign(
      {},
      (typeof hosts === 'string') ? { hosts: hosts } : hosts,
      options
    );

    this.prefix = options.prefix || '';

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

    this.memcached = ['get', 'set', 'delete', 'flush'].reduce((obj, method) => {
      obj[method] = pify(client[method].bind(client));
      return obj;
    }, {});
  }

  getKey(key) {
    return this.prefix + key;
  }

  get(key) {
    key = this.getKey(key);

    return this.memcached.get(key).then(value => {
      if (value === null) {
        return undefined;
      }
      return value.toString();
    });
  }

  set(key, value, ttl) {
    key = this.getKey(key);

    if (typeof value === 'undefined') {
      return Promise.resolve(undefined);
    }

    if (typeof ttl !== 'number') {
      ttl = oneDay;
    }

    ttl = Math.trunc(ttl / 1000);

    return this.memcached.set(key, value, {expires: ttl});
  }

  delete(key) {
    key = this.getKey(key);

    return this.memcached.delete(key);
  }

  clear() {
    return this.memcached.flush();
  }
}

module.exports = KeyvMemjs;