import { useState, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';

export interface SearchItem {
  type: 'page' | 'section';
  title: string;
  path: string;
  section?: string;
  elementId?: string;
  content: string;
}

interface SearchResult {
  item: SearchItem;
  score?: number;
}

// Define the page structure for indexing
const pageStructure: SearchItem[] = [
  // Overview Page
  {
    type: 'page',
    title: 'Infrastructure Overview',
    path: '/',
    content: 'Infrastructure Overview Dashboard Active Processes Active Connections System Uptime Storage Volumes System Performance CPU Memory Disk Network',
  },
  {
    type: 'section',
    title: 'System Performance Overview',
    path: '/',
    section: 'system-performance',
    elementId: 'system-performance-section',
    content: 'Historical performance metrics over the last 90 minutes CPU Memory Disk Usage System Chart Performance Trends',
  },
  {
    type: 'section',
    title: 'Current System Metrics',
    path: '/',
    section: 'current-metrics',
    elementId: 'current-metrics-section',
    content: 'CPU Usage Memory Usage Disk Usage Real-time metrics Performance indicators Usage percentages Resource utilization',
  },
  {
    type: 'section',
    title: 'Active Services',
    path: '/',
    section: 'active-services',
    elementId: 'active-services-section',
    content: 'Running processes Top CPU processes Top Memory processes Process status Service health Process management',
  },
  {
    type: 'section',
    title: 'System Status',
    path: '/',
    section: 'system-status',
    elementId: 'system-status-section',
    content: 'Web Server Database Storage Network Status Operating System version Component health System health indicators',
  },

  // System Health Page
  {
    type: 'page',
    title: 'System Health Monitoring',
    path: '/system-health',
    content: 'System Health Monitoring Dashboard Status Overview Component Health Service Status Resource Usage Metrics',
  },
  {
    type: 'section',
    title: 'Component Status',
    path: '/system-health',
    section: 'component-status',
    elementId: 'component-status-section',
    content: '🌐 Web Servers (3) 🗄️ Database Cluster ⚖️ Load Balancer 💾 Storage Systems Component Status Last Check Response Time Actions View Details Health Check Results',
  },
  {
    type: 'section',
    title: 'System Overview',
    path: '/system-health',
    section: 'system-overview',
    elementId: 'system-overview-section',
    content: 'Component Status Run Health Check Status Last Check Response Time Actions View Details System Health Overview',
  },
  {
    type: 'section',
    title: 'CPU Metrics',
    path: '/system-health',
    section: 'cpu-metrics',
    elementId: 'cpu-metrics-section',
    content: 'CPU Usage Overall CPU Load User CPU System CPU IO Wait CPU Temperature Core Usage Processor Performance',
  },
  {
    type: 'section',
    title: 'Memory Metrics',
    path: '/system-health',
    section: 'memory-metrics',
    elementId: 'memory-metrics-section',
    content: 'Memory Usage Physical Memory Virtual Memory Swap Usage Page Faults Cache Usage Memory Performance RAM Utilization',
  },
  {
    type: 'section',
    title: 'Network Metrics',
    path: '/system-health',
    section: 'network-metrics',
    elementId: 'network-metrics-section',
    content: 'Network Traffic Bandwidth Usage Packets In/Out Network Errors Network Collisions DNS Response Time Network Latency Connection Status',
  },
  {
    type: 'section',
    title: 'Disk Metrics',
    path: '/system-health',
    section: 'disk-metrics',
    elementId: 'disk-metrics-section',
    content: 'Disk Usage Storage Volumes Read/Write Speed IO Operations SMART Status Disk Health Storage Performance File System Usage',
  },
  {
    type: 'section',
    title: 'Running Services',
    path: '/system-health',
    section: 'services-metrics',
    elementId: 'services-metrics-section',
    content: 'Running Services Service Name PID CPU Usage Memory Usage Status Total Services Running Stopped Sleeping Sort by CPU Sort by Memory Service Management',
  },
  {
    type: 'section',
    title: 'Per-Core CPU Usage',
    path: '/system-health',
    section: 'cpu-metrics',
    elementId: 'cpu-metrics-section',
    content: 'Per-core CPU usage chart Core frequency Core utilization CPU core breakdown'
  },
  {
    type: 'section',
    title: 'Swap & Virtual Memory',
    path: '/system-health',
    section: 'memory-metrics',
    elementId: 'memory-metrics-section',
    content: 'Swap memory usage Virtual memory usage Swap/Virtual memory charts RAM swap virtual summary'
  },
  {
    type: 'section',
    title: 'SMART Disk Health',
    path: '/system-health',
    section: 'disk-metrics',
    elementId: 'disk-metrics-section',
    content: 'SMART disk health table Disk health status DeviceId FriendlyName HealthStatus MediaType OperationalStatus Size'
  },
  {
    type: 'section',
    title: 'Process Summary',
    path: '/system-health',
    section: 'processes-metrics',
    elementId: 'processes-metrics-section',
    content: 'Process summary chart Running Sleeping Zombie Stopped Top CPU Top Memory Process state pie chart'
  },
  {
    type: 'section',
    title: 'System Info Cards',
    path: '/system-health',
    section: 'system-info',
    elementId: 'system-overview-section',
    content: 'Uptime Last Boot Hostname Manufacturer Model OS Version System info cards'
  },

  // CloudWatch Page
  {
    type: 'page',
    title: 'CloudWatch Metrics',
    path: '/cloudwatch',
    content: 'CloudWatch Metrics Monitoring Dashboard Time Range Filter Performance Charts Historical Data',
  },
  {
    type: 'section',
    title: 'CPU Utilization',
    path: '/cloudwatch',
    section: 'cpu-utilization',
    elementId: 'cpu-utilization-section',
    content: 'CPU Usage Chart CPU Performance Metrics CPU Load History CPU Trends Processor Utilization',
  },
  {
    type: 'section',
    title: 'Memory Usage',
    path: '/cloudwatch',
    section: 'memory-usage',
    elementId: 'memory-usage-section',
    content: 'Memory Usage Chart RAM Utilization Memory Performance Memory Trends Available Memory Used Memory',
  },
  {
    type: 'section',
    title: 'Disk Usage',
    path: '/cloudwatch',
    section: 'disk-usage',
    elementId: 'disk-usage-section',
    content: 'Storage Usage Chart Disk Performance IO Operations Storage Trends Disk Health Storage Capacity',
  },
  {
    type: 'section',
    title: 'Network Traffic',
    path: '/cloudwatch',
    section: 'network-traffic',
    elementId: 'network-traffic-section',
    content: 'Network Traffic Chart Connections In Connections Out Network Performance Bandwidth Usage Network Health',
  },
  {
    type: 'section',
    title: 'Metrics Summary',
    path: '/cloudwatch',
    section: 'metrics-summary',
    elementId: 'metrics-summary-section',
    content: 'Timestamp CPU Usage Memory Usage Disk Usage Network In Network Out Historical Data Performance Summary',
  },

  // Asset Inventory Page
  {
    type: 'page',
    title: 'Asset Inventory',
    path: '/asset-inventory',
    content: 'Asset Inventory Hardware Assets Software Assets System Information Infrastructure Components Resource Management',
  },
  {
    type: 'section',
    title: 'System Information',
    path: '/asset-inventory',
    section: 'system-info',
    elementId: 'system-info-section',
    content: 'Operating System Hostname Architecture Uptime System Details OS Version Kernel Version System Configuration',
  },
  {
    type: 'section',
    title: 'CPU Information',
    path: '/asset-inventory',
    section: 'cpu-info',
    elementId: 'cpu-info-section',
    content: 'Processor Model CPU Cores CPU Threads Current Usage Base Speed Max Speed CPU Cache CPU Features Processor Details',
  },
  {
    type: 'section',
    title: 'Memory Information',
    path: '/asset-inventory',
    section: 'memory-info',
    elementId: 'memory-info-section',
    content: 'Total Memory Used Memory Free Memory Memory Type Memory Speed RAM Configuration Memory Modules Memory Details',
  },
  {
    type: 'section',
    title: 'Storage Information',
    path: '/asset-inventory',
    section: 'storage-info',
    elementId: 'storage-info-section',
    content: 'Storage Devices Disk Drives Used Space Free Space Storage Type Drive Health RAID Configuration Storage Details',
  },
  {
    type: 'section',
    title: 'Network Information',
    path: '/asset-inventory',
    section: 'network-info',
    elementId: 'network-info-section',
    content: 'Network Interfaces IP Addresses Active Connections Network Protocols DNS Settings Network Configuration Network Details',
  },

  // EC2 Instances Page
  {
    type: 'page',
    title: 'EC2 Instance Details',
    path: '/ec2-instances',
    content: 'EC2 Instances Cloud Resources Instance Management Security Groups Instance History AWS Resources',
  },
  {
    type: 'section',
    title: 'Instance Information',
    path: '/ec2-instances',
    section: 'instance-info',
    elementId: 'instance-info-section',
    content: 'Instance ID Instance Type Launch Time State IP Addresses Tags Instance Details EC2 Configuration',
  },
  {
    type: 'section',
    title: 'System Information',
    path: '/ec2-instances',
    section: 'system-info',
    elementId: 'system-info-section',
    content: 'OS Architecture Kernel Version Uptime Operating System Details System Configuration Cloud Init',
  },
  {
    type: 'section',
    title: 'Security Groups',
    path: '/ec2-instances',
    section: 'security-groups',
    elementId: 'security-groups-section',
    content: 'Security Group Rules Inbound Rules Outbound Rules Port Configuration Network Access Security Settings',
  },
  {
    type: 'section',
    title: 'Storage Volumes',
    path: '/ec2-instances',
    section: 'storage-volumes',
    elementId: 'storage-volumes-section',
    content: 'EBS Volumes Volume Type IOPS Size Encryption Status Storage Configuration Volume Management',
  },
  {
    type: 'section',
    title: 'Monitoring',
    path: '/ec2-instances',
    section: 'monitoring',
    elementId: 'monitoring-section',
    content: 'CloudWatch Metrics CPU Utilization Network Traffic Disk IO Status Checks Performance Monitoring',
  },
  {
    type: 'section',
    title: 'Firewall Status',
    path: '/ec2-instances',
    section: 'firewall-status',
    elementId: 'firewall-status-section',
    content: 'Firewall status Domain Private Public Firewall badges Security state'
  },
  {
    type: 'section',
    title: 'Last Boot & Hostname',
    path: '/ec2-instances',
    section: 'system-info',
    elementId: 'system-info-section',
    content: 'Last Boot Hostname System info EC2 instance details'
  },

  // Load Balancers Page
  {
    type: 'page',
    title: 'Load Balancers',
    path: '/load-balancers',
    content: 'Load Balancer Management Traffic Distribution Health Checks Load Distribution Network Load Balancing',
  },
  {
    type: 'section',
    title: 'Load Balancer Status',
    path: '/load-balancers',
    section: 'lb-status',
    elementId: 'lb-status-section',
    content: 'Status Health State DNS Name Availability Zones Security Groups Load Balancer Configuration',
  },
  {
    type: 'section',
    title: 'Target Groups',
    path: '/load-balancers',
    section: 'target-groups',
    elementId: 'target-groups-section',
    content: 'Target Health Registered Targets Health Check Settings Port Configuration Target Group Management',
  },
  {
    type: 'section',
    title: 'Listeners',
    path: '/load-balancers',
    section: 'listeners',
    elementId: 'listeners-section',
    content: 'Listener Rules Protocol Port SSL Certificates Routing Configuration Listener Management',
  },
  {
    type: 'section',
    title: 'Monitoring',
    path: '/load-balancers',
    section: 'monitoring',
    elementId: 'monitoring-section',
    content: 'Request Count Latency Error Rate Healthy Hosts Performance Metrics Load Balancer Monitoring',
  },

  // Settings Page
  {
    type: 'page',
    title: 'Settings & Maintenance',
    path: '/settings',
    content: 'Settings Maintenance Backups Alerts Logs Users System configuration'
  },
  {
    type: 'section',
    title: 'Backups Module',
    path: '/settings',
    section: 'backups',
    elementId: undefined,
    content: 'Backups module Backup error Last backup time Refresh backups Backup status'
  },
  {
    type: 'section',
    title: 'Other Settings',
    path: '/settings',
    section: 'other-settings',
    elementId: undefined,
    content: 'Configure Alerts Download Logs Manage Users Settings actions'
  }
];

const fuseOptions = {
  keys: ['title', 'content'],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: true
};

export const useSearchIndex = () => {
  const [fuse, setFuse] = useState<Fuse<SearchItem> | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFuse(new Fuse(pageStructure, fuseOptions));
  }, []);

  const search = useCallback((query: string) => {
    if (!fuse || !query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = fuse.search(query);
      // Sort results: pages first, then sections
      const sortedResults = searchResults.sort((a, b) => {
        if (a.item.type === 'page' && b.item.type !== 'page') return -1;
        if (a.item.type !== 'page' && b.item.type === 'page') return 1;
        return (a.score || 0) - (b.score || 0);
      });
      setResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [fuse]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    search,
    results,
    isLoading,
    clearResults
  };
};

export default useSearchIndex; 