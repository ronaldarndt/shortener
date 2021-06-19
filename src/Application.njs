import Nullstack from 'nullstack';
import { TedisPool } from 'tedis';
import Home from './Home';
import './Application.scss';

class Application extends Nullstack {
  static async start(context) {
    context.redis = new TedisPool({
      host: context.secrets.host,
      port: context.secrets.port,
      password: context.secrets.password,
    });

    context.server.get('/l/:id', async (request, response) => {
      const client = await context.redis.getTedis();

      const url = await client.hget('uuid', request.params.id);

      context.redis.putTedis(client);

      if (url) {
        response.redirect(301, url);
      } else {
        response.status(404).end();
      }
    });
  }

  terminate({ redis }) {
    redis.release();
  }

  render() {
    return (
      <main>
        <Home route="/" />
      </main>
    );
  }
}

export default Application;
