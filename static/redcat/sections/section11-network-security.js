/**
 * Section 11: Network Security
 * NEW SECTION - firewalld focus for RHCSA EX200
 * 3 unique question sets for practice variety
 * 
 * Focus areas:
 * - firewalld zones and services
 * - Making rules persistent
 * - Adding specific ports
 * - Rich rules
 */

const section11Data = {
    id: 11,
    title: "Network Security",
    description: "Master firewalld configuration for securing network services and ports.",
    totalPoints: 20,
    
    questionSets: {
        set1: [
            {
                id: 1,
                category: "Audit",
                description: "List all currently active firewalld zones.",
                expected: [
                    { command: "firewall-cmd", requiredValues: ["--get-active-zones"] }
                ],
                explanation: "firewall-cmd --get-active-zones shows which zones are currently in use and their associated interfaces.",
                points: 1
            },
            {
                id: 2,
                category: "Audit",
                description: "Display the default firewalld zone.",
                expected: [
                    { command: "firewall-cmd", requiredValues: ["--get-default-zone"] }
                ],
                explanation: "The default zone is applied to interfaces that aren't explicitly assigned to a zone.",
                points: 1
            },
            {
                id: 3,
                category: "Implementation",
                description: "Add the HTTP service to the firewall permanently.",
                expected: {
                    command: "firewall-cmd",
                    requiredFlags: ["--permanent"],
                    requiredValues: ["--add-service=http"]
                },
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredValues: ["--list-services"] },
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--list-services"] }
                ],
                explanation: "The --permanent flag ensures the rule persists across reboots. Without it, rules are runtime-only.",
                points: 3
            },
            {
                id: 4,
                category: "Implementation",
                description: "Reload the firewall to apply permanent changes without disconnecting active connections.",
                expected: {
                    command: "firewall-cmd",
                    requiredValues: ["--reload"]
                },
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredValues: ["--state"] }
                ],
                explanation: "firewall-cmd --reload applies permanent rules without dropping established connections.",
                points: 2
            },
            {
                id: 5,
                category: "Audit",
                description: "Verify that the HTTP service is now allowed in the firewall.",
                expected: [
                    { command: "firewall-cmd", requiredValues: ["--list-services"] },
                    { command: "firewall-cmd", requiredValues: ["--list-all"] }
                ],
                explanation: "firewall-cmd --list-services shows allowed services in the current zone.",
                points: 1
            },
            {
                id: 6,
                category: "Implementation",
                description: "Permanently open TCP port 8080 in the default zone.",
                expected: {
                    command: "firewall-cmd",
                    requiredFlags: ["--permanent"],
                    requiredValues: ["--add-port=8080/tcp"]
                },
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredValues: ["--list-ports"] },
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--list-ports"] }
                ],
                explanation: "Use --add-port=<port>/<protocol> to open specific ports. Remember to reload after adding permanent rules.",
                points: 3
            },
            {
                id: 7,
                category: "Implementation",
                description: "Reload the firewall configuration.",
                expected: {
                    command: "firewall-cmd",
                    requiredValues: ["--reload"]
                },
                allowedPreChecks: [],
                explanation: "Always reload after adding permanent rules.",
                points: 1
            },
            {
                id: 8,
                category: "Implementation",
                description: "Add both HTTPS and MySQL services to the firewall permanently.",
                expected: {
                    command: "firewall-cmd",
                    requiredFlags: ["--permanent"],
                    requiredValues: ["--add-service=https", "--add-service=mysql"]
                },
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--list-services"] }
                ],
                explanation: "Multiple services can be added in one command or separate commands.",
                points: 3
            },
            {
                id: 9,
                category: "Audit",
                description: "List all permanently configured firewall rules.",
                expected: [
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--list-all"] }
                ],
                explanation: "firewall-cmd --permanent --list-all shows the saved configuration that survives reboots.",
                points: 2
            },
            {
                id: 10,
                category: "Implementation",
                description: "Remove the MySQL service from the permanent firewall configuration.",
                expected: {
                    command: "firewall-cmd",
                    requiredFlags: ["--permanent"],
                    requiredValues: ["--remove-service=mysql"]
                },
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--list-services"] }
                ],
                explanation: "Use --remove-service to revoke access. Don't forget to reload.",
                points: 3
            }
        ],
        set2: [
            // Placeholder for set2
            {
                id: 1,
                category: "Implementation",
                description: "Permanently add the SMTP service to the firewall.",
                expected: {
                    command: "firewall-cmd",
                    requiredFlags: ["--permanent"],
                    requiredValues: ["--add-service=smtp"]
                },
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--list-services"] }
                ],
                explanation: "SMTP (port 25) is used for email transmission.",
                points: 3
            }
        ],
        set3: [
            // Placeholder for set3
            {
                id: 1,
                category: "Implementation",
                description: "Permanently open UDP port 161 for SNMP traffic.",
                expected: {
                    command: "firewall-cmd",
                    requiredFlags: ["--permanent"],
                    requiredValues: ["--add-port=161/udp"]
                },
                allowedPreChecks: [
                    { command: "firewall-cmd", requiredFlags: ["--permanent"], requiredValues: ["--list-ports"] }
                ],
                explanation: "SNMP typically uses UDP port 161 for monitoring.",
                points: 3
            }
        ]
    }
};
