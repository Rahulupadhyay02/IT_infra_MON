import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import { MonitoringData } from '../types/monitoring';

// Fallback data for development/demo purposes
const fallbackData: MonitoringData = {
  monitoring: {
    cpu: {
      hardware: {
        baseSpeed: 0,
        cores: 0,
        maxSpeed: 0,
        modelName: "",
        processors: 0,
        threads: 0
      },
      perCore: [],
      usage: {
        idle: 0,
        iowait: 0,
        loadAverages: {
          "15min": 0,
          "1min": 0,
          "5min": 0
        },
        overall: 0,
        system: 0,
        user: 0
      }
    },
    memory: {
      physical: {
        available: 0,
        buffers: 0,
        cached: 0,
        free: 0,
        sharedMemory: 0,
        swapCached: 0,
        total: 0,
        used: 0
      },
      swap: {
        free: 0,
        swappiness: 0,
        total: 0,
        used: 0
      },
      virtualMemory: {
        free: 0,
        total: 0,
        used: 0
      }
    },
    network: {
      connections: {
        closeWait: 0,
        established: 0,
        listening: 0,
        timeWait: 0,
        total: 0
      },
      dns: {
        cacheSize: 0,
        responseTime: 0,
        servers: []
      }
    },
    processes: {
      summary: {
        running: 0,
        sleeping: 0,
        stopped: 0,
        total: 0,
        zombie: 0
      },
      topProcesses: {
        cpu: [],
        memory: []
      }
    },
    storage: {
      volumes: []
    },
    systemInfo: {
      basics: {
        hardware: {
          biosVersion: "",
          manufacturer: "",
          model: "",
          serialNumber: ""
        },
        hostname: "",
        os: {
          architecture: "",
          kernel: "",
          lastBoot: "",
          name: "",
          uptime: "",
          version: ""
        }
      }
    },
    timestamp: ""
  }
};

export const useFirebaseData = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    console.log('Setting up Firebase listener...');
    const monitoringRef = ref(database, 'monitoring');
    console.log('Database reference created:', monitoringRef);
    setLoading(true);

    const unsubscribe = onValue(monitoringRef, (snapshot) => {
      console.log('Received Firebase data:', snapshot.val());
      try {
        const value = snapshot.val();
        if (value && value['server-info']) {
          console.log('Processing server info:', value['server-info']);
          // Get the latest timestamp
          const timestamps = Object.keys(value['server-info'] || {}).sort().reverse();
          console.log('Available timestamps:', timestamps);
          
          if (timestamps.length > 0) {
            const latestTimestamp = timestamps[0];
            console.log('Setting data with latest timestamp:', latestTimestamp);
            
            const latestData = value['server-info'][latestTimestamp];
            const monitoringData: MonitoringData = {
              monitoring: {
                'server-info': {
                  [latestTimestamp]: latestData
                },
                full: value.full || {},
                health: value.health || {},
                info: value.info || {},
                metrics: value.metrics || {},
                network: value.network || {},
                services: value.services || {}
              }
            };
            
            setData(monitoringData);
            setLastUpdate(new Date());
            setError(null);
          } else {
            console.log('No timestamps found in server-info');
            setData(null);
            setError('No server info available');
          }
        } else {
          console.log('No data received from Firebase');
          setData(null);
          setError('No data available');
        }
      } catch (err) {
        console.error('Data parsing error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Firebase subscription error:', error);
      setError('Failed to fetch data');
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up Firebase listener');
      unsubscribe();
      off(monitoringRef);
    };
  }, []);

  return { data, loading, error, lastUpdate };
};