const si = require('systeminformation');
const shell = require('shelljs');

const red = '#dc3545';
const orange = '#fd7e14';
const yellow = '#ffc107';
const green = '#28a745';

async function getVpnStatus() {
  const stdout = shell.exec('sudo expressvpn status', {shell: '/usr/bin/bash'});
  console.log("------ VPN status: ", stdout);
  return !stdout.stdout.includes('Not connected');
}

export async function getServerSideProps() {
  try {
    const query = {
      cpuCurrentspeed: 'avg',
      cpuTemperature: 'main',
      mem: '*',
      osInfo: 'distro, release, codename, kernel, arch',
      versions: '*',
      currentLoad: 'avgload, currentload, currentload_user, currentload_system, currentload_idle',
      fsSize: '*',
    };

    const data = await si.get(query);

    const vpnStatus = await getVpnStatus();

    return { props: { data, connected: vpnStatus } };
  } catch (e) {
    console.log(e);
    return { props: {} };
  }
}

function cpuTempColor(temp) {
  if (temp < 40) {
    return green;
  }
  if (temp >= 40 && temp < 50) {
    return yellow;
  }
  if (temp >= 50 && temp < 60) {
    return orange;
  }

  return red;
}

function cpuLoadColor(load) {
  if (load < 30) {
    return green;
  }
  if (load >= 30 && load < 45) {
    return yellow;
  }
  if (load >= 45 && load < 60) {
    return orange;
  }

  return red;
}

function memUsedColor(available, total) {
  const used = ((total - available) / total * 100).toFixed(0);

  if (used < 30) {
    return green;
  }
  if (used >= 30 && used < 45) {
    return yellow;
  }
  if (used >= 45 && used < 60) {
    return orange;
  }

  return red;
}

function diskUsedColor(use) {
  if (use < 50) {
    return green;
  }
  if (use >= 50 && use < 75) {
    return yellow;
  }
  if (use >= 75 && use < 90) {
    return orange;
  }

  return red;
}

export default function Home(
  {
    data,
    connected,
  }) {

  const partitions = data.fsSize.map(partition => {
    return (
      <div className="d-flex">
        <div>
        <svg viewBox="-25 -35 150 150" style={ { display: "block", width: "100px" } }>
          <path
            d="M 50,50 m 0,-48 a 48,48 0 1 1 0,96 a 48,48 0 1 1 0,-96"
            stroke="#eee"
            strokeWidth="30"
            fillOpacity="0"/>
          <path
            d="M 50,50 m 0,-48 a 48,48 0 1 1 0,96 a 48,48 0 1 1 0,-96"
            stroke={ diskUsedColor(partition.use) }
            strokeWidth="30"
            fillOpacity="0"
            style={ {
              strokeDasharray: "301.635, 301.635",
              strokeDashoffset: `${ (1 - partition.use / 100) * 301.635 }`
            } }
          />
        </svg>
        <div className="progressbar-text text-muted text-center"
             style={ {
               padding: '0px',
               margin: '0px',
               fontSize: '0.8rem',
               position: 'relative',
               top: '-55px',
               left: '0',
             } }
        >
          { partition.use.toFixed(0) + '%' }
        </div>
        </div>
        <div className="d-flex align-items-center ml-3">
          <div className="d-flex flex-column justify-content-center">
            <div className=""><strong>{ partition.mount }</strong></div>
            <div className="text-black-50">
              <small>
                { 'Total: ' + (partition.size/1024/1024/1024).toFixed(0) + ' GB'}
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  });

  const tempColor = cpuTempColor(data.cpuTemperature.main);
  const loadColor = cpuLoadColor(data.currentLoad.avgload * 100);
  const usedColor = memUsedColor(data.mem.available, data.mem.total);

  return (
    <div className="">
      <nav className="navbar navbar-dark bg-dark d-flex justify-content-center">
        <img src="/pi.png" style={ { height: 20 } }/>
        <div className="ml-2 text-center text-light">Pi Monitor</div>
      </nav>
      <main className="container">
        <div className="text-center py-2">
          <strong>{ data.osInfo.distro }</strong> { `${ data.osInfo.release } (${ data.osInfo.codename }) ${ data.osInfo.kernel } ${ data.osInfo.arch }` }
        </div>

        {connected &&
        <div className="alert alert-success d-flex justify-content-between align-items-center">
          <div>Connected to VPN</div>
        </div>
        }
        {!connected &&
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          Not Connected to VPN
        </div>
        }

        <div className="row">
          <div className="card col-md-4 col-sm-12 m-3">
            <div
              className="card-title pl-3 pt-3 mt-1 mb-2 pb-0 text-muted">{ `CPU - ${ data.cpuCurrentspeed.avg } GHz` }</div>
            <div className="card-body pt-0">
              <div className="d-flex justify-content-around align-items-center">
                <div className="card-text h1 text-center">
                  { data.cpuTemperature.main.toFixed(0) }‎ °C
                </div>
                <div className="progress progress-bar-vertical">
                  <div className={ `progress-bar progress-bar-striped` }
                       role="progressbar" aria-valuemin="0" aria-valuemax="100"
                       style={ {
                         height: data.cpuTemperature.main * 100 / 90 + '%',
                         backgroundColor: tempColor,
                       } }>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card col-md-6 col-sm-12 m-3">
            <div className="card-title">
              <div className="card-body">
                <div>
                  <div className="text-muted mb-2">
                    { `CPU Load (user - ${ parseInt(data.currentLoad.currentload_user) }%, sys - ${ parseInt(data.currentLoad.currentload_system) }%)` }
                  </div>
                  <div className="progress" style={ { height: '2rem', fontSize: '0.75rem' } }>
                    <div className={ `progress-bar progress-bar` }
                         role="progressbar"
                         aria-valuemin="0"
                         aria-valuemax="100"
                         style={ {
                           width: data.currentLoad.avgload * 100 + '%',
                           height: '2rem',
                           backgroundColor: loadColor,
                         } }
                    >
                      { `avg ${ (data.currentLoad.avgload * 100).toFixed(0) }%` }
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-muted mb-2">
                    { `Memory` }
                  </div>
                  <div className="progress" style={ { height: '2rem', fontSize: '0.75rem' } }>
                    <div className={ `progress-bar progress-bar` }
                         role="progressbar"
                         aria-valuemin="0"
                         aria-valuemax="100"
                         style={ {
                           width: (1 - data.mem.available / data.mem.total) * 100 + '%',
                           height: '2rem',
                           backgroundColor: usedColor,
                         } }
                    >
                      { `used ${ ((1 - data.mem.available / data.mem.total) * 100).toFixed(0) }%` }
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-muted mb-2">
                    Disk & File System
                  </div>
                  {
                    partitions
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{ `        
        .progress-bar-vertical {
          width: 20px;
          min-height: 100px;
          display: flex;
          align-items: flex-end;
          margin-right: 20px;
          float: left;
        }
        
        .progress-bar-vertical .progress-bar {
          width: 100%;
          height: 0;
          -webkit-transition: height 0.6s ease;
          -o-transition: height 0.6s ease;
          transition: height 0.6s ease;
        }
      ` }</style>
    </div>
  );
}

