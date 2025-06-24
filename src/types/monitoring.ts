export interface MonitoringData {
  monitoring: {
    'server-info': {
      [timestamp: string]: ServerInfo;
    };
    full: Record<string, {
      instance: {
        region: string;
        status: string;
        timestamp: string;
      };
    }>;
    health: Record<string, {
      loadAverage: [number, number, number];
      operatingSystem: {
        kernel: string;
        name: string;
        version: string;
      };
      processes: {
        running: number;
        sleeping: number;
        total: number;
        uptime: string;
        uptimeSeconds: number;
      };
    }>;
    info: Record<string, {
      architecture: string;
      availabilityZone: string;
      instanceId: string;
      launchTime: string;
      name: string;
      platform: string;
      privateIp: string;
      publicIp: string;
      region: string;
      status: string;
      subnetId: string;
      type: string;
      vpcId: string;
    }>;
    metrics: Record<string, {
      cpu: {
        average1min: number;
        average5min: number;
        cores: number;
        current: number;
      };
      disk: {
        free: number;
        iops: {
          read: number;
          write: number;
        };
        percentage: number;
        total: number;
        used: number;
      };
      memory: {
        buffers: number;
        total: number;
        used: number;
      };
      network: {
        bytesIn: number;
        bytesOut: number;
        interfaceName: string;
        packetsIn: number;
        packetsOut: number;
        timestamp: string;
      };
    }>;
    network: Record<string, {
      activeConnections: number;
      openPorts: number[];
      closeWait?: number;
      established?: number;
      listening?: number;
      timeWait?: number;
      total?: number;
      dns?: {
        cacheSize: number;
        responseTime: number;
        servers: string[];
      };
    }>;
    services: Record<string, Array<{
      cpu: number;
      memory: number;
      name: string;
      pid: number;
      status: string;
    }>>;
  };
}

export interface SystemHealth {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  lastCheck: string;
  responseTime: string;
}

export interface Ticket {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  status: string;
  created: string;
}

interface ServerInfo {
  backups?: {
    error: string;
  };
  cpu: {
    hardware: {
      baseSpeed: number;
      cores: number;
      maxSpeed: number;
      modelName: string;
      processors: number;
      threads: number;
    };
    perCore: Array<{
      frequency: number;
      id: number;
      usage: number;
    }>;
    usage: {
      idle: number;
      iowait: number;
      loadAverages: {
        '15min': number;
        '1min': number;
        '5min': number;
      };
      overall: number;
      system: number;
      user: number;
    };
  };
  firewall: {
    domain: string;
    private: string;
    public: string;
  };
  memory: {
    physical: {
      available: number;
      buffers: number;
      cached: number;
      free: number;
      sharedMemory: number;
      swapCached: number;
      total: number;
      used: number;
    };
    swap: {
      free: number;
      swappiness: number;
      total: number;
      used: number;
    };
    virtualMemory: {
      free: number;
      total: number;
      used: number;
    };
  };
  mysql?: {
    error: string;
  };
  network: {
    connections: {
      closeWait: number;
      established: number;
      listening: number;
      timeWait: number;
      total: number;
    };
    dns: {
      cacheSize: number;
      responseTime: number;
      servers: string[];
    };
  };
  processes: {
    summary: {
      running: number;
      sleeping: number;
      stopped: number;
      total: number;
      zombie: number;
    };
    topProcesses: {
      cpu: Array<ProcessInfo>;
      memory: Array<ProcessInfo>;
    };
  };
  smart: {
    disks: Array<{
      DeviceId: string;
      FriendlyName: string;
      HealthStatus: string;
      MediaType: string;
      OperationalStatus: string;
      Size: number;
    }>;
  };
  storage: {
    volumes: Array<{
      device: string;
      fileSystem: string;
      mountPoint: string;
      size: {
        free: number;
        percentage: number;
        total: number;
        used: number;
      };
      smart: {
        status: string;
      };
    }>;
  };
  systemInfo: {
    basics: {
      hardware: {
        biosVersion: string;
        manufacturer: string;
        model: string;
        serialNumber: string;
      };
      hostname: string;
      os: {
        architecture: string;
        kernel: string;
        lastBoot: string;
        name: string;
        uptime: string;
        version: string;
      };
    };
  };
  timestamp: string;
}

interface ProcessInfo {
  cpu_percent: number;
  create_time: number;
  memory_percent: number;
  name: string;
  num_threads: number;
  pid: number;
  status: string;
  username: string;
}

export interface ServerData {
  'server-info': Record<string, ServerInfo>;
}