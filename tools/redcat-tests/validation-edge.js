const fs=require('fs'),vm=require('vm');const root=require('./lib').ROOT;let pass=0,fail=0;
let code='';for(const f of fs.readdirSync(root+'/sections').sort())code+=fs.readFileSync(root+'/sections/'+f,'utf8')+'\n';
code+=fs.readFileSync(root+'/data.js','utf8')+'\n'+fs.readFileSync(root+'/modules/validation.js','utf8')+';globalThis.__x={sections,validateCommand,parseGrepCommand};';
const ctx={console};vm.createContext(ctx);vm.runInContext(code,ctx);
const {sections,validateCommand,parseGrepCommand}=ctx.__x;
const find=(s,set,id)=>sections.find(x=>x.id===s).questionSets['set'+set].find(t=>t.id===id);
function check(s,set,id,input,want){
  const t=find(s,set,id);const g=parseGrepCommand(input);
  let r=validateCommand(input,t.expected);if(!r.valid&&g)r=validateCommand(g.command,t.expected);
  if(r.valid===want)pass++;else{fail++;console.log(`FAIL S${s}/${set}/#${id} ${want?'accept':'reject'}: ${input}`);}
}
check(2,4,1,'usermod -aG wheel admin1',true);
check(2,4,1,'usermod -Ga wheel admin1',true);
check(2,4,1,'usermod -G wheel admin1',false);
check(2,1,5,'echo "RedHat2026!" | passwd --stdin bob',true);
check(2,1,3,'useradd -u 4001 -G developers bob',true);
check(2,1,3,'useradd -u 4001 bob',false);
check(8,4,1,'ps -ef',true);check(8,4,1,'ps aux',true);check(8,4,1,'ps -aux',true);
check(8,4,2,'ps aux | grep httpd',true);
check(10,1,10,'firewall-cmd --reload',true);
check(10,1,9,'firewall-cmd --permanent --add-service=http',true);
check(10,1,9,'firewall-cmd --add-service=http',false);
check(17,1,2,"date -s '2024-12-25 10:30:00'",true);
check(16,3,5,'podman exec database mysql -uroot -psecret123 -e "SELECT 1;"',true);
check(3,6,5,'find /opt/app -type d -exec chmod 750 {} \;',true);
check(3,6,5,"find /opt/app -type d -exec chmod 750 {} ';'",true);
check(3,6,7,'find /var/www ! -user apache > /tmp/wrong-owner.txt',true);
check(3,6,7,'find /var/www -not -user apache > /tmp/wrong-owner.txt',true);
/* dropped (task no longer exists or changed): check(3,6,6,'vgcreate -s 8M appvg /dev/sdd1 /dev/sde1',true) */;
check(8,3,8,'systemctl kill rsyslog',false);
check(8,3,8,'systemctl kill -s SIGKILL rsyslog',true);
/* dropped (task no longer exists or changed): check(6,4,10,'lvrename /dev/datavg/applv /dev/datavg/weblv',true) */;
check(13,3,5,'dnf autoremove',false);
check(12,2,6,'semanage fcontext -a -t httpd_sys_content_t "/web(/.*)?"',true);
check(1,1,5,'tar -czf /tmp/httpd-config.tar.gz /etc/httpd',true);
check(1,1,5,'tar czf /tmp/httpd-config.tar.gz /etc/httpd',true);
check(1,1,5,'tar -cf /tmp/httpd-config.tar.gz /etc/httpd',false);
console.log(`validation (edge): ok ${pass} fail ${fail}`);
process.exitCode = fail ? 1 : 0;
