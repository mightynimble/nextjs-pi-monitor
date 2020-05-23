const si = require('systeminformation');

export async function getServerSideProps() {
  try {
    const query = {
      time: 'current, uptime, timezoneName',
	    cpu: 'manufacturer, vender, speed, speedmin, speedmax, physicalCores',
	    cpuCurrentspeed: 'min, max, avg',
	    cpuTemperature: 'main',
	    mem: '*',
	    osInfo: 'distro, release, codename, kernel, arch',
	    versions: '*',
	    currentLoad: 'avgload, currentload, currentload_user, currentload_system, currentload_nice, currentload_idle',

    };


    const data = await si.get(query);

	  const currentLoad = await si.currentLoad();
	  const fsSize = await si.fsSize();


    return { props: { data, currentLoad, fsSize, } };
  } catch (e) {
    console.log(e);
    return { props: {} };
  }
}

export default function Home(
  {
    data, currentLoad, fsSize,
  }) {
	console.log("------ data: ", data);
	console.log("------ currentLoad: ", currentLoad);
	console.log("------ fsSize: ", fsSize);
  return (
    <div className="container">
      <main>
        <h1 className="title">
          Pi Monitor
        </h1>
      </main>

      <footer>
      </footer>

      <style jsx>{ `
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        
        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }
      ` }</style>

      <style jsx global>{ `
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      ` }</style>
    </div>
  );
}

