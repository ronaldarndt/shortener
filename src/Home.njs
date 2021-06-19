import Nullstack from 'nullstack';
import normalizeUrl from 'normalize-url';

const random = (len = 8) => {
  return Math.random()
    .toString(36)
    .slice(-len)
    .split('')
    .map(x => (Math.random() > 0.5 ? x.toUpperCase() : x))
    .join('');
};

const normalize = url =>
  normalizeUrl(url, {
    normalizeProtocol: true,
    stripWWW: true,
    stripTextFragment: false,
  });

class Home extends Nullstack {
  url = '';
  shortened = '';

  static async shortenAsync({ url, redis }) {
    const client = await redis.getTedis();

    const val = await client.get(url);

    if (val) {
      return val;
    }

    const shortened = random();

    await client.set(url, shortened);
    await client.hset('uuid', shortened, url);

    redis.putTedis(client);

    return shortened;
  }

  static async flushAsync({ redis }) {
    const client = await redis.getTedis();

    await client.command('FLUSHDB');

    redis.putTedis(client);
  }

  async onSubmit() {
    this.shortened = await this.shortenAsync({
      url: normalize(this.url),
    });
  }

  async flush() {
    await this.flushAsync();
  }

  render() {
    if (this.shortened) {
      const url = location.href + 'l/' + this.shortened;

      return (
        <div>
          <a href={url}>{url}</a>
        </div>
      );
    }

    return (
      <div>
        <button onclick={this.flush}>CLEAR DATABASE</button>

        <form onsubmit={this.onSubmit}>
          <input type="text" bind={this.url}></input>
          <button>Shorten</button>
        </form>
      </div>
    );
  }
}

export default Home;
