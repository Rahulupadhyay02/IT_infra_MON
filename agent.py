from flask import Flask, jsonify
from flask_cors import CORS
import platform
import psutil
import datetime
import socket
import subprocess
import wmi
import json

app = Flask(__name__)
CORS(app)

c = wmi.WMI()
os_info = c.Win32_OperatingSystem()[0]
bios_info = c.Win32_BIOS()[0]
computer_system = c.Win32_ComputerSystem()[0]

def get_system_info():
    boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())
    uptime = datetime.datetime.now() - boot_time
    return {
        "systemInfo": {
            "basics": {
                "hostname": socket.gethostname(),
                "os": {
                    "name": os_info.Caption,
                    "version": os_info.Version,
                    "kernel": platform.release(),
                    "architecture": platform.machine(),
                    "lastBoot": boot_time.isoformat(),
                    "uptime": str(uptime).split('.')[0]
                },
                "hardware": {
                    "manufacturer": computer_system.Manufacturer,
                    "model": computer_system.Model,
                    "serialNumber": bios_info.SerialNumber.strip(),
                    "biosVersion": bios_info.SMBIOSBIOSVersion
                }
            }
        }
    }

def get_cpu_info():
    freq = psutil.cpu_freq()
    usage = psutil.cpu_times_percent()
    return {
        "cpu": {
            "hardware": {
                "processors": 1,
                "cores": psutil.cpu_count(logical=False),
                "threads": psutil.cpu_count(logical=True),
                "modelName": platform.processor(),
                "baseSpeed": round(freq.min, 2) if freq else None,
                "maxSpeed": round(freq.max, 2) if freq else None
            },
            "usage": {
                "overall": psutil.cpu_percent(interval=1),
                "user": usage.user,
                "system": usage.system,
                "idle": usage.idle,
                "iowait": getattr(usage, 'iowait', 0),
                "loadAverages": {
                    "1min": 0,
                    "5min": 0,
                    "15min": 0
                }
            },
            "temperature": {
                "current": None,
                "min": None,
                "max": None,
                "critical": None
            },
            "perCore": [
                {"id": i, "usage": u, "temperature": None, "frequency": freq.current if freq else None}
                for i, u in enumerate(psutil.cpu_percent(percpu=True))
            ]
        }
    }

def get_memory_info():
    vm = psutil.virtual_memory()
    sm = psutil.swap_memory()
    return {
        "memory": {
            "physical": {
                "total": vm.total // (1024 * 1024),
                "used": vm.used // (1024 * 1024),
                "free": vm.free // (1024 * 1024),
                "available": vm.available // (1024 * 1024),
                "buffers": 0,
                "cached": 0,
                "sharedMemory": 0,
                "swapCached": 0
            },
            "swap": {
                "total": sm.total // (1024 * 1024),
                "used": sm.used // (1024 * 1024),
                "free": sm.free // (1024 * 1024),
                "swappiness": 0
            },
            "virtualMemory": {
                "total": (vm.total + sm.total) // (1024 * 1024),
                "used": (vm.used + sm.used) // (1024 * 1024),
                "free": (vm.available + sm.free) // (1024 * 1024)
            }
        }
    }

def get_disk_info():
    partitions = psutil.disk_partitions()
    volumes = []
    for p in partitions:
        try:
            usage = psutil.disk_usage(p.mountpoint)
            volumes.append({
                "device": p.device,
                "mountPoint": p.mountpoint,
                "fileSystem": p.fstype,
                "size": {
                    "total": usage.total // (1024 * 1024),
                    "used": usage.used // (1024 * 1024),
                    "free": usage.free // (1024 * 1024),
                    "percentage": usage.percent
                },
                "performance": {
                    "iops": {"read": None, "write": None},
                    "throughput": {"read": None, "write": None},
                    "latency": {"read": None, "write": None}
                },
                "smart": {
                    "status": "unknown",
                    "temperature": None,
                    "powerOnHours": None,
                    "reallocatedSectors": None,
                    "pendingSectors": None
                }
            })
        except Exception:
            continue
    return {"storage": {"volumes": volumes, "raidArrays": []}}

def get_network_info():
    return {
        "network": {
            "interfaces": [],
            "connections": {
                "total": len(psutil.net_connections()),
                "established": len([c for c in psutil.net_connections() if c.status == 'ESTABLISHED']),
                "listening": len([c for c in psutil.net_connections() if c.status == 'LISTEN']),
                "timeWait": len([c for c in psutil.net_connections() if c.status == 'TIME_WAIT']),
                "closeWait": len([c for c in psutil.net_connections() if c.status == 'CLOSE_WAIT'])
            },
            "dns": {
                "servers": ["8.8.8.8", "8.8.4.4"],
                "responseTime": 25,
                "cacheSize": 1000
            }
        }
    }

def get_process_info():
    all_p = list(psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent', 'status', 'num_threads', 'create_time']))
    top_cpu = sorted(all_p, key=lambda p: p.info['cpu_percent'], reverse=True)[:1]
    top_mem = sorted(all_p, key=lambda p: p.info['memory_percent'], reverse=True)[:1]
    return {
        "processes": {
            "summary": {
                "total": len(all_p),
                "running": len([p for p in all_p if p.info['status'] == 'running']),
                "sleeping": len([p for p in all_p if p.info['status'] == 'sleeping']),
                "stopped": 0,
                "zombie": 0
            },
            "topProcesses": {
                "cpu": [p.info for p in top_cpu],
                "memory": [p.info for p in top_mem]
            }
        }
    }

def get_firewall_status():
    try:
        output = subprocess.check_output(['netsh', 'advfirewall', 'show', 'allprofiles'], text=True)
        status = {"domain": None, "private": None, "public": None}
        lines = output.splitlines()
        current = None
        for line in lines:
            line = line.strip()
            if "Domain Profile Settings" in line:
                current = "domain"
            elif "Private Profile Settings" in line:
                current = "private"
            elif "Public Profile Settings" in line:
                current = "public"
            elif line.startswith("State") and current:
                state_value = line.split()[-1]
                status[current] = state_value
        return {"firewall": status}
    except Exception as e:
        return {"firewall": {"error": str(e)}}

def get_backup_jobs():
    try:
        output = subprocess.check_output(['schtasks', '/query', '/fo', 'LIST', '/v'], text=True)
        tasks = []
        for block in output.split("

"):
            if "Backup" in block:
                task = {}
                for line in block.split("
"):
                    if ":" in line:
                        key, value = line.split(":", 1)
                        task[key.strip()] = value.strip()
                tasks.append({
                    "taskName": task.get("TaskName", "Unknown"),
                    "lastRun": task.get("Last Run Time", "Unknown"),
                    "nextRun": task.get("Next Run Time", "Unknown"),
                    "status": task.get("Last Result", "Unknown")
                })
        return {"backups": tasks}
    except Exception as e:
        return {"backups": {"error": str(e)}}

def get_smart_info():
    try:
        command = [
            "powershell", "-Command",
            "Get-PhysicalDisk | Select-Object DeviceId, FriendlyName, HealthStatus, OperationalStatus, MediaType, Size | ConvertTo-Json"
        ]
        output = subprocess.check_output(command, text=True)
        disks = json.loads(output)
        if isinstance(disks, dict): disks = [disks]
        return {"smart": {"disks": disks}}
    except Exception as e:
        return {"smart": {"error": str(e)}}

def get_mysql_metrics():
    try:
        result = subprocess.check_output([
            'mysql', '-u', 'root', '-pYourPassword', '-e', 'SHOW GLOBAL STATUS'
        ], text=True)
        lines = result.strip().splitlines()
        metrics = {}
        for line in lines[1:]:
            parts = line.split()
            if len(parts) == 2:
                key, val = parts
                if key in ["Threads_connected", "Queries", "Connections", "Slow_queries"]:
                    try:
                        metrics[key] = int(val)
                    except ValueError:
                        metrics[key] = val
        return {"mysql": metrics}
    except Exception as e:
        return {"mysql": {"error": str(e)}}

@app.route('/api/server-info')
def server_info():
    data = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }
    data.update(get_system_info())
    data.update(get_cpu_info())
    data.update(get_memory_info())
    data.update(get_disk_info())
    data.update(get_network_info())
    data.update(get_process_info())
    data.update(get_firewall_status())
    data.update(get_backup_jobs())
    data.update(get_smart_info())
    data.update(get_mysql_metrics())
    return jsonify(data)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
