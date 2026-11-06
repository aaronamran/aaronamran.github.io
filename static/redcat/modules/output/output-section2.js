/** Red Cat - Section 2: Users and Groups */

// Set configs keyed by set index
const _s2 = {
    1: { user: 'bob',       uid: 4001, gid: 4001, group: 'developers', groupGid: 3000, pw: 'RedHat2026!', maxDays: 60, warnDays: 7 },
    2: { user: 'sarah',     uid: 6500, gid: 5500, group: 'webadmins',  groupGid: 5500, pw: 'Secure@Web99', maxDays: 45, warnDays: 7 },
    3: { user: 'appadmin',  uid: 998,  gid: 999,  group: 'appsvc',     groupGid: 999,  pw: null,          maxDays: 99999, warnDays: 7 }
};

function _s2cfg() {
    const idx = getQuestionSetForSection(appState.currentSectionId);
    return _s2[idx] || _s2[1];
}

function generateSection2Output(command, input, tokens) {
    const c = _s2cfg();
    const isSet3 = (getQuestionSetForSection(appState.currentSectionId) === 3);

    // groupadd
    if (command === 'groupadd') {
        return null; // silent success
    }

    // useradd
    if (command === 'useradd') {
        return null; // silent success
    }

    // usermod
    if (command === 'usermod') {
        return null; // silent success
    }

    // passwd --stdin (non-interactive password set)
    if (command === 'echo' && input.includes('passwd') && input.includes('--stdin')) {
        return `Changing password for user ${c.user}.\npasswd: all authentication tokens updated successfully.`;
    }

    // passwd -S <user> : password status
    if (command === 'passwd' && input.includes('-S')) {
        const progress = appState.sectionProgress[appState.currentSectionId];
        const done = progress ? progress.completedTasks : [];
        const hasPassword = done.includes(5);
        const isLocked = done.includes(9);
        if (isLocked) {
            return `${c.user} LK 2026-04-07 0 ${c.maxDays} ${c.warnDays} -1 (Password locked.)`;
        }
        if (hasPassword) {
            return `${c.user} PS 2026-04-07 0 ${c.maxDays} ${c.warnDays} -1 (Password set, SHA512 crypt.)`;
        }
        return `${c.user} NP 2026-04-07 0 99999 7 -1 (No password.)`;
    }

    // passwd -l <user> : lock account
    if (command === 'passwd' && input.includes('-l')) {
        return `Locking password for user ${c.user}.\npasswd: Success`;
    }

    // chage -l <user> : list password aging
    if (command === 'chage' && input.includes('-l')) {
        const progress = appState.sectionProgress[appState.currentSectionId];
        const done = progress ? progress.completedTasks : [];
        const maxDays = done.includes(7) ? c.maxDays : 99999;
        const warnDays = done.includes(7) ? c.warnDays : 7;
        return `Last password change\t\t\t: Apr 07, 2026\nPassword expires\t\t\t: ${maxDays === 99999 ? 'never' : ('Jun 06, 2026')}\nPassword inactive\t\t\t: never\nAccount expires\t\t\t\t: never\nMinimum number of days between password change\t: 0\nMaximum number of days between password change\t: ${maxDays}\nNumber of days of warning before password expires\t: ${warnDays}`;
    }

    // chage -M / -W : set aging
    if (command === 'chage' && (input.includes('-M') || input.includes('-W'))) {
        return null; // silent success
    }

    // chage -E : set expiry
    if (command === 'chage' && input.includes('-E')) {
        return null;
    }

    // id <user>
    if (command === 'id') {
        if (isSet3) {
            return `uid=998(appadmin) gid=999(appsvc) groups=999(appsvc)`;
        }
        if (input.includes('sarah') || (getQuestionSetForSection(appState.currentSectionId) === 2)) {
            return `uid=6500(sarah) gid=5500(webadmins) groups=5500(webadmins)`;
        }
        return `uid=4001(bob) gid=4001(bob) groups=4001(bob),3000(developers)`;
    }

    // getent group [name|gid]
    if (command === 'getent' && input.includes('group')) {
        if (input.includes(c.group) || input.includes(String(c.groupGid))) {
            return `${c.group}:x:${c.groupGid}:${isSet3 ? '' : c.user}`;
        }
        // getent group (all)
        if (!input.includes('group ') || tokens[2] === 'group') {
            return `root:x:0:\nbin:x:1:\ndaemon:x:2:\n${c.group}:x:${c.groupGid}:${isSet3 ? '' : c.user}`;
        }
    }

    // grep <group> /etc/group
    if (command === 'grep' && input.includes('/etc/group')) {
        return `${c.group}:x:${c.groupGid}:${isSet3 ? '' : c.user}`;
    }

    // getent passwd <user>
    if (command === 'getent' && input.includes('passwd')) {
        if (isSet3) {
            return `appadmin:x:998:999::/nonexistent:/sbin/nologin`;
        }
        const shell = '/bin/bash';
        const home = `/home/${c.user}`;
        return `${c.user}:x:${c.uid}:${c.gid}::${home}:${shell}`;
    }

    // grep <user> /etc/passwd
    if (command === 'grep' && input.includes('/etc/passwd')) {
        if (isSet3) {
            return `appadmin:x:998:999::/nonexistent:/sbin/nologin`;
        }
        return `${c.user}:x:${c.uid}:${c.gid}::${'/home/' + c.user}:/bin/bash`;
    }

    // cat /etc/passwd (show all)
    if (command === 'cat' && input.includes('/etc/passwd')) {
        const shell = isSet3 ? '/sbin/nologin' : '/bin/bash';
        const home = isSet3 ? '/nonexistent' : `/home/${c.user}`;
        return `root:x:0:0:root:/root:/bin/bash\nbin:x:1:1:bin:/bin:/sbin/nologin\ndaemon:x:2:2:daemon:/sbin:/sbin/nologin\n...\n${c.user}:x:${c.uid}:${c.gid}::${home}:${shell}`;
    }

    // getent shadow <user>
    if (command === 'getent' && input.includes('shadow')) {
        const progress = appState.sectionProgress[appState.currentSectionId];
        const done = progress ? progress.completedTasks : [];
        const hasPassword = done.includes(5);
        const isLocked = done.includes(9);
        const hash = isLocked
            ? `!$6$rounds=5000$salt123456789$xKjD1mNLpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWx`
            : (hasPassword
                ? `$6$rounds=5000$salt123456789$xKjD1mNLpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWx`
                : '!!');
        return `${c.user}:${hash}:19820:0:99999:7:::`;
    }

    // grep <user> /etc/shadow
    if (command === 'grep' && input.includes('/etc/shadow')) {
        const progress = appState.sectionProgress[appState.currentSectionId];
        const done = progress ? progress.completedTasks : [];
        const hasPassword = done.includes(5);
        const isLocked = done.includes(9);
        const hash = isLocked
            ? `!$6$rounds=5000$salt123456789$xKjD1mNLpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWx`
            : (hasPassword
                ? `$6$rounds=5000$salt123456789$xKjD1mNLpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWx`
                : '!!');
        return `${c.user}:${hash}:19820:0:99999:7:::`;
    }

    // useradd -e (contractor with expiry in set3)
    // chage -E (set expiry)
    // 'contractor' user for set3 task5
    if (command === 'id' && input.includes('contractor')) {
        return `uid=1001(contractor) gid=1001(contractor) groups=1001(contractor)`;
    }

    if (command === 'getent' && input.includes('passwd') && (input.includes('contractor'))) {
        return `contractor:x:1001:1001::/home/contractor:/bin/bash`;
    }

    if ((command === 'chage') && input.includes('-l') && input.includes('contractor')) {
        return `Last password change\t\t\t: Apr 07, 2026\nPassword expires\t\t\t: never\nPassword inactive\t\t\t: never\nAccount expires\t\t\t\t: Dec 31, 2026\nMinimum number of days between password change\t: 0\nMaximum number of days between password change\t: 99999\nNumber of days of warning before password expires\t: 7`;
    }

    return null;
}

function generateSection2PreCheck(task, command, input, tokens) {
    const c = _s2cfg();

    // pre-check for group existence (before creating)
    if (command === 'getent' && input.includes('group')) {
        if (input.includes(c.group) || input.includes(String(c.groupGid))) {
            return `getent: key '${c.group}' not found in 'group'`;
        }
    }

    // pre-check: user not created yet
    if (command === 'id' && input.includes(c.user)) {
        return `id: '${c.user}': no such user`;
    }

    // pre-check: no entry in passwd
    if (command === 'getent' && input.includes('passwd') && input.includes(c.user)) {
        return null; // empty = not found
    }

    // pre-check: no password yet (shadow)
    if ((command === 'grep' || command === 'getent') && input.includes('shadow') && input.includes(c.user)) {
        return `${c.user}:!!:19820:0:99999:7:::`;
    }

    // pre-check before chage: show current maxdays
    if (command === 'chage' && input.includes('-l') && input.includes(c.user)) {
        return `Last password change\t\t\t: Apr 07, 2026\nPassword expires\t\t\t: never\nPassword inactive\t\t\t: never\nAccount expires\t\t\t\t: never\nMinimum number of days between password change\t: 0\nMaximum number of days between password change\t: 99999\nNumber of days of warning before password expires\t: 7`;
    }

    // pre-check before usermod -s : show current shell
    if ((command === 'grep' || command === 'getent') && input.includes('passwd') && input.includes(c.user)) {
        return `${c.user}:x:${c.uid}:${c.gid}::${'/home/' + c.user}:/bin/sh`;
    }

    // pre-check before lock: show unlocked status
    if (command === 'passwd' && input.includes('-S') && input.includes(c.user)) {
        return `${c.user} PS 2026-04-07 0 99999 7 -1 (Password set, SHA512 crypt.)`;
    }

    return null;
}
