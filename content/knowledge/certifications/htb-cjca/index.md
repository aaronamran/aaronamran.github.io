---
title: 'HTB CJCA'
category: 'Defensive Cybersecurity'
---


<div class="writeup-header">
<div class="writeup-header-text">
<div class="writeup-org">Knowledge</div>
<h1 class="writeup-title"><strong>HackTheBox Certified Junior Cybersecurity Analyst (HTB CJCA)</strong></h1>
</div>
</div>

<br />


## 1. Network Foundations {#ch1-network-foundations}

<br />

### 1.1 Network Concepts {#ch1.1-network-concepts}

<h4 class="mb-2"><strong>&gt; OSI vs. TCP/IP Model Breakdown</strong></h4>
<p class="lead mb-4">A direct mapping and operational summary of network architecture layers across both standard models:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>OSI Layer</th>
      <th>TCP/IP Layer</th>
      <th>Data Unit / Focus</th>
      <th>Core Functions &amp; Protocols</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>7. Application</strong></td>
      <td rowspan="3"><strong>Application</strong></td>
      <td>Data</td>
      <td>Provides network services directly to end-user applications (HTTP, FTP, SMTP, DNS).</td>
    </tr>
    <tr>
      <td><strong>6. Presentation</strong></td>
      <td>Data</td>
      <td>Data translation, format conversion, compression, and encryption/decryption.</td>
    </tr>
    <tr>
      <td><strong>5. Session</strong></td>
      <td>Data</td>
      <td>Establishes, manages, checkpoints, and terminates ongoing application sessions.</td>
    </tr>
    <tr>
      <td><strong>4. Transport</strong></td>
      <td><strong>Transport</strong></td>
      <td>Segments (TCP) / Datagrams (UDP)</td>
      <td>End-to-end communication, segmentation, flow control, and error checking (TCP = connection-oriented, UDP = connectionless).</td>
    </tr>
    <tr>
      <td><strong>3. Network</strong></td>
      <td><strong>Internet</strong></td>
      <td>Packets</td>
      <td>Logical addressing and path determination/routing across multiple networks (IP, ICMP; Routers).</td>
    </tr>
    <tr>
      <td><strong>2. Data Link</strong></td>
      <td rowspan="2"><strong>Link</strong></td>
      <td>Frames</td>
      <td>Node-to-node data transfer, physical addressing, synchronization, and error detection (MAC Addresses; Switches, Bridges).</td>
    </tr>
    <tr>
      <td><strong>1. Physical</strong></td>
      <td>Bits</td>
      <td>Transmission of raw bitstreams over physical transmission media (Ethernet cables, Hubs, Repeaters).</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; File Transfer Processing Sequence</strong></h4>
<p class="lead mb-4">The step-by-step encapsulation path when transferring a file across network layers:</p>
<ul>
  <li><strong>Application:</strong> Initiates the raw file transfer request.</li>
  <li><strong>Presentation:</strong> Encrypts and formats the data for secure travel.</li>
  <li><strong>Session:</strong> Establishes and tracks the communication session with the remote host.</li>
  <li><strong>Transport:</strong> Breaks the file payload into manageable segments for error-free delivery.</li>
  <li><strong>Network:</strong> Assigns IP addressing and determines optimal routing paths.</li>
  <li><strong>Data Link:</strong> Encapsulates packets into frames with source/destination MAC addresses.</li>
  <li><strong>Physical:</strong> Converts frames into raw electronic/optical bitstreams over physical media.</li>
</ul>

<br />

### 1.2 Network Communication {#ch1.2-network-communication}

<h4 class="mb-2"><strong>&gt; Addressing &amp; Ports Overview</strong></h4>
<p class="lead mb-4">Network communications rely on a multi-layered addressing architecture to ensure data reaches the correct device and application across local and global networks:</p>
<ul>
  <li><strong>MAC Addresses (Layer 2):</strong> Physical, globally unique hardware identifiers hardcoded into Network Interface Cards (NICs) for local network (LAN) delivery.</li>
  <li><strong>IP Addresses (Layer 3):</strong> Logical network identifiers used by routers to navigate data packets across interconnected networks.</li>
  <li><strong>Ports (Layer 4):</strong> Numerical indicators that direct incoming traffic to specific running software applications or processes.</li>
</ul>

<h4 class="mb-2"><strong>&gt; Addressing Types Comparison Table</strong></h4>
<p class="lead mb-4">A direct structural breakdown of physical, logical, and application-level network identifiers:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Identifier Type</th>
      <th>OSI Layer</th>
      <th>Format &amp; Length</th>
      <th>Primary Function &amp; Tools</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>MAC Address</strong></td>
      <td>Layer 2 (Data Link)</td>
      <td>48-bit Hexadecimal; 6 pairs (e.g., <code>00:1A:2B:3C:4D:5E</code>).
        <ul>
          <li>First 24 bits: Manufacturer OUI.</li>
          <li>Last 24 bits: Unique device ID.</li>
        </ul>
      </td>
      <td>Delivers frames to the exact physical hardware on a LAN. Identified on Windows via <code>getmac</code>. ARP maps IP addresses to MAC addresses.</td>
    </tr>
    <tr>
      <td><strong>IPv4 Address</strong></td>
      <td>Layer 3 (Network)</td>
      <td>32-bit space formatted as 4 dotted decimal numbers (e.g., <code>192.168.1.1</code>).</td>
      <td>Flexible, non-permanent logical addressing used by routers to determine optimal paths across networks.</td>
    </tr>
    <tr>
      <td><strong>IPv6 Address</strong></td>
      <td>Layer 3 (Network)</td>
      <td>128-bit space formatted in 8 groups of 4 hexadecimal digits (e.g., <code>2001:0db8:...</code>).</td>
      <td>Expanded addressing standard designed to solve IPv4 address space exhaustion.</td>
    </tr>
    <tr>
      <td><strong>Port Numbers</strong></td>
      <td>Layer 4 (Transport)</td>
      <td>16-bit integer ranging from 0 to 65535.</td>
      <td>Multiplexes network traffic to direct data to specific applications/services running on an IP address. Inspected via <code>netstat</code>.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Port Ranges Classification</strong></h4>
<p class="lead mb-4">Port numbers are split into three ranges managed or standardized by IANA:</p>
<ul>
  <li><strong>Well-Known Ports (0–1023):</strong> Reserved for universal, system-level core protocols (e.g., FTP [20/21], HTTP [80], HTTPS [443]).</li>
  <li><strong>Registered Ports (1024–49151):</strong> Assigned to specific third-party applications or databases (e.g., MS SQL Server [1433]).</li>
  <li><strong>Dynamic / Ephemeral Ports (49152–65535):</strong> Temporary ports randomly assigned by client operating systems for session-based communication.</li>
</ul>

<h4 class="mb-2"><strong>&gt; End-to-End Web Request Sequence</strong></h4>
<p class="lead mb-4">The path of a web browsing request from initial lookup to processing and return:</p>
<ul>
  <li><strong>1. DNS Resolution:</strong> The domain name (e.g., <code>example.com</code>) is resolved to a target IP address.</li>
  <li><strong>2. Client Encapsulation:</strong> The browser builds an HTTP/HTTPS request, targets server ports 80/443, assigns a dynamic client source port, attaches target IP routing data, and uses ARP to address the frame to the local gateway router's MAC address.</li>
  <li><strong>3. Network Transmission:</strong> The local gateway receives the frame and forwards the packet through intermediate routers toward the destination IP address.</li>
  <li><strong>4. Server Processing:</strong> The destination server receives the packet and routes it to the application listening on port 80/443 to process the HTTP payload.</li>
  <li><strong>5. Response Delivery:</strong> The server sends a response targeting the client's temporary source port, following the reverse path back through the network based on source IP and port data.</li>
</ul>

<br />

### 1.3 Dynamic Host Configuration Protocol (DHCP) {#ch1.3-dhcp}

<h4 class="mb-2"><strong>&gt; DHCP Overview</strong></h4>
<p class="lead mb-4">Dynamic Host Configuration Protocol (DHCP) automates network parameter allocation to streamline IP management and prevent IP conflicts:</p>
<ul>
  <li><strong>Core Purpose:</strong> Automatically assigns dynamic IP addresses, subnet masks, default gateways, and DNS server addresses to client devices without manual intervention.</li>
  <li><strong>Efficiency &amp; Address Reuse:</strong> Optimizes address pool availability by reclaiming unused IP addresses when devices disconnect.</li>
  <li><strong>Lease Management:</strong> IP assignments are temporary and bound by a lease duration. Clients must send a renewal request before lease expiration to retain their active network configuration.</li>
</ul>

<h4 class="mb-2"><strong>&gt; DHCP Component Roles Table</strong></h4>
<p class="lead mb-4">Functional responsibilities of the client and server within the DHCP architecture:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Component Role</th>
      <th>Primary Operational Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>DHCP Server</strong></td>
      <td>Network device or service (e.g., router, dedicated server) that manages the IP address pool, lease schedules, and network configurations.</td>
    </tr>
    <tr>
      <td><strong>DHCP Client</strong></td>
      <td>Any endpoint device connecting to a network that requests automatically assigned configuration parameters.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; The DORA Handshake Process</strong></h4>
<p class="lead mb-4">The sequential 4-step communication loop used to assign and acknowledge an IP address lease:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Step</th>
      <th>Handshake Phase</th>
      <th>Protocol Message Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1</strong></td>
      <td><strong>Discover</strong></td>
      <td>The client broadcasts a <code>DHCP Discover</code> message to locate available DHCP servers on the local network.</td>
    </tr>
    <tr>
      <td><strong>2</strong></td>
      <td><strong>Offer</strong></td>
      <td>The DHCP server responds with a <code>DHCP Offer</code> message proposing an available IP address and lease parameters.</td>
    </tr>
    <tr>
      <td><strong>3</strong></td>
      <td><strong>Request</strong></td>
      <td>The client replies with a <code>DHCP Request</code> message confirming its intent to accept the offered IP lease.</td>
    </tr>
    <tr>
      <td><strong>4</strong></td>
      <td><strong>Acknowledge</strong></td>
      <td>The server returns a <code>DHCP Acknowledge</code> (ACK) message to finalize the lease configuration, granting the client active network access.</td>
    </tr>
  </tbody>
</table>

<br />

### 1.4 Network Address Translation (NAT) {#ch1.4-nat}

<h4 class="mb-2"><strong>&gt; Network Address Translation (NAT) Overview</strong></h4>
<p class="lead mb-4">Network Address Translation (NAT) maps internal IP addresses to external public IP addresses at the router level to overcome IPv4 exhaustion and improve internal security:</p>
<ul>
  <li><strong>Core Function:</strong> Modifies source or destination IP address headers on packets traversing between private local networks (LAN) and the public internet (WAN).</li>
  <li><strong>Public vs. Private IPs:</strong> 
    <ul>
      <li><em>Public IPs:</em> Globally unique, internet-routable addresses assigned by ISPs (e.g., <code>8.8.8.8</code>).</li>
      <li><em>Private IPs (RFC 1918):</em> Non-routable internal addresses used for LAN connectivity. Includes ranges <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, and <code>192.168.0.0/16</code>.</li>
    </ul>
  </li>
  <li><strong>Security Advantage:</strong> Isolates internal hosts by obscuring local network structures from direct internet exposure.</li>
</ul>

<h4 class="mb-2"><strong>&gt; NAT Types Comparison Table</strong></h4>
<p class="lead mb-4">A breakdown of the functional implementations of Network Address Translation:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>NAT Type</th>
      <th>Mapping Architecture</th>
      <th>Primary Characteristics &amp; Use Cases</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Static NAT</strong></td>
      <td>1-to-1 Mapping</td>
      <td>Maps a single fixed private IP address to a single dedicated public IP address. Commonly used for web or application servers hosting public services.</td>
    </tr>
    <tr>
      <td><strong>Dynamic NAT</strong></td>
      <td>Many-to-Many Mapping (Pool-based)</td>
      <td>Assigns an available public IP address from a pool to an internal host on-demand based on network traffic.</td>
    </tr>
    <tr>
      <td><strong>Port Address Translation (PAT)</strong></td>
      <td>Many-to-1 Mapping (NAT Overload)</td>
      <td>Allows multiple private IP devices to share a single public IP address by assigning distinct dynamic port numbers to each connection. Most common implementation in home and SMB networks.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; NAT Benefits &amp; Trade-Offs</strong></h4>
<p class="lead mb-4">Key operational advantages and drawbacks of implementing NAT architectures:</p>
<ul>
  <li><strong>Benefits:</strong> Conserves IPv4 address space, provides basic internal topology masking, and allows flexible internal IP scheme changes without affecting public mappings.</li>
  <li><strong>Trade-Offs:</strong> Breaks end-to-end connectivity protocols, adds complexity to troubleshooting, and requires custom port forwarding rules to host public internal servers.</li>
</ul>

<br />

### 1.5 Domain Name System (DNS) {#ch1.5-dns}

<h4 class="mb-2"><strong>&gt; Domain Name System (DNS) Overview</strong></h4>
<p class="lead mb-4">The Domain Name System (DNS) translates human-friendly domain names into machine-readable IP addresses across global networks:</p>
<ul>
  <li><strong>Core Purpose:</strong> Serves as the internet's phonebook, mapping domain names (e.g., <code>www.google.com</code>) to underlying IP addresses (e.g., <code>93.184.216.34</code>) so users do not need to memorize numerical identifiers.</li>
  <li><strong>Efficiency &amp; Caching:</strong> Resolved address lookups are cached locally by clients and recursive servers to accelerate future requests and reduce global DNS traffic load.</li>
</ul>

<h4 class="mb-2"><strong>&gt; DNS Organizational Hierarchy Table</strong></h4>
<p class="lead mb-4">A breakdown of the tree-like structure governing domain name delegation:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Hierarchy Level</th>
      <th>Structural Role</th>
      <th>Example Instance</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Root Servers</strong></td>
      <td>The top of the DNS hierarchy that directs recursive queries to TLD servers.</td>
      <td><code>.</code> (Root zone)</td>
    </tr>
    <tr>
      <td><strong>Top-Level Domain (TLD)</strong></td>
      <td>Generic (gTLD) or country-code (ccTLD) name servers managing broad domain classifications.</td>
      <td><code>.com</code>, <code>.org</code>, <code>.net</code>, <code>.uk</code></td>
    </tr>
    <tr>
      <td><strong>Second-Level Domain</strong></td>
      <td>The custom registered domain name directly under a TLD.</td>
      <td><code>example</code> in <code>example.com</code></td>
    </tr>
    <tr>
      <td><strong>Subdomain / Hostname</strong></td>
      <td>Specific service or machine prefixes designated by the domain owner.</td>
      <td><code>www</code> in <code>www.example.com</code> or <code>accounts</code> in <code>accounts.google.com</code></td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; DNS Resolution Process (Domain Translation)</strong></h4>
<p class="lead mb-4">The step-by-step query sequence executed when translating a domain into an IP address:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Step</th>
      <th>Resolution Phase</th>
      <th>Action Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1</strong></td>
      <td><strong>Client Request</strong></td>
      <td>User enters a domain (e.g., <code>www.example.com</code>) into a web browser.</td>
    </tr>
    <tr>
      <td><strong>2</strong></td>
      <td><strong>Local Cache Check</strong></td>
      <td>The local OS checks its DNS cache; if found, it immediately resolves the request locally.</td>
    </tr>
    <tr>
      <td><strong>3</strong></td>
      <td><strong>Recursive Server Query</strong></td>
      <td>If missing locally, the client queries a Recursive Resolver (e.g., ISP, Google 8.8.8.8, Cloudflare 1.1.1.1).</td>
    </tr>
    <tr>
      <td><strong>4</strong></td>
      <td><strong>Root Server Lookup</strong></td>
      <td>The Recursive Resolver queries a Root Server, which redirects to the appropriate TLD server (e.g., <code>.com</code>).</td>
    </tr>
    <tr>
      <td><strong>5</strong></td>
      <td><strong>TLD Server Lookup</strong></td>
      <td>The TLD Name Server directs the resolver to the Authoritative Name Server for <code>example.com</code>.</td>
    </tr>
    <tr>
      <td><strong>6</strong></td>
      <td><strong>Authoritative Lookup</strong></td>
      <td>The Authoritative Name Server returns the final IP address (e.g., <code>93.184.216.34</code>) to the resolver.</td>
    </tr>
    <tr>
      <td><strong>7</strong></td>
      <td><strong>Client Connection</strong></td>
      <td>The resolver caches and returns the IP address to the client browser to establish a direct connection to the target web server.</td>
    </tr>
  </tbody>
</table>

<br />

### 1.6 Internet Architecture {#ch1.6-internet-architecture}

<h4 class="mb-2"><strong>&gt; Internet Architecture Overview</strong></h4>
<p class="lead mb-4">Internet Architecture defines how data is structured, routed, and managed across global networks to balance performance, scalability, security, and administrative overhead:</p>
<ul>
  <li><strong>Architectural Paradigms:</strong> Range from traditional direct host models to cloud-scale dynamic environments.</li>
  <li><strong>Tiered Engineering:</strong> Decouples presentation, business logic, and data storage to isolate failure domains and optimize workload distribution.</li>
  <li><strong>Control Plane Decoupling:</strong> Modern paradigms centralize network decision-making via software automation to streamline hardware operations.</li>
</ul>

<h4 class="mb-2"><strong>&gt; Architecture Types Breakdown</strong></h4>
<p class="lead mb-4">A detailed breakdown of core architectural paradigms, including client-server tiers and deployment models:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Architecture Paradigm</th>
      <th>Operational Mechanics &amp; Structure</th>
      <th>Key Advantages</th>
      <th>Trade-Offs &amp; Drawbacks</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Peer-to-Peer (P2P)</strong></td>
      <td>Nodes act simultaneously as clients and servers, exchanging resources directly without mandatory central hosting (e.g., BitTorrent).</td>
      <td>
        <ul>
          <li>High scalability as added nodes contribute compute/bandwidth.</li>
          <li>High resilience against single-point outages.</li>
          <li>Distributed resource costs.</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Complex decentralized security and update policy management.</li>
          <li>Resource availability drops if active peers disconnect.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>Client-Server (General)</strong></td>
      <td>Centralized servers host applications and respond directly to requests initiated by client endpoints (e.g., standard web browsing).</td>
      <td>
        <ul>
          <li>Centralized data control and simplified management.</li>
          <li>Uniform policy enforcement and optimized server hardware.</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Central server acts as a single point of failure.</li>
          <li>High infrastructure, operational, and bandwidth costs.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>Client-Server: 1-Tier</strong></td>
      <td>Client UI, application processing, and database reside entirely on a single machine.</td>
      <td>Simple setup for isolated local software.</td>
      <td>Extremely limited scalability and severe security restrictions.</td>
    </tr>
    <tr>
      <td><strong>Client-Server: 2-Tier</strong></td>
      <td>Client executes the presentation layer and communicates directly with a central database server.</td>
      <td>Direct data querying suitable for local desktop applications.</td>
      <td>Lacks business logic abstraction; not applicable to standard web applications.</td>
    </tr>
    <tr>
      <td><strong>Client-Server: 3-Tier / N-Tier</strong></td>
      <td>Separates presentation (client), business processing (application server), and data storage (database server) into isolated functional layers.</td>
      <td>Maximum flexibility, independent scaling, and isolated component maintenance.</td>
      <td>Deployment complexity, interconnect configuration overhead, and potential performance bottlenecks between tiers.</td>
    </tr>
    <tr>
      <td><strong>Hybrid</strong></td>
      <td>Blends central servers for session management/authentication with direct P2P data streaming between nodes (e.g., video conferencing).</td>
      <td>
        <ul>
          <li>Offloads heavy data bandwidth from central servers.</li>
          <li>Maintains central administrative control and directory services.</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Complex dual-system design.</li>
          <li>Peer discovery halts if central coordinating servers fail.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>Cloud</strong></td>
      <td>Virtualized, third-party hosted compute infrastructure delivering on-demand services (SaaS, PaaS, IaaS) over the internet.</td>
      <td>
        <ul>
          <li>Dynamic elasticity and rapid self-service provisioning.</li>
          <li>Shared resource pooling with measured pay-per-use pricing.</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Vendor lock-in risk.</li>
          <li>Third-party data privacy/compliance exposure.</li>
          <li>Requires constant internet connectivity.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>Software-Defined (SDN)</strong></td>
      <td>Decouples the centralized software control plane (routing/policy decisions) from the underlying data plane (packet forwarding hardware).</td>
      <td>
        <ul>
          <li>Programmable, automated, and dynamic network traffic management.</li>
          <li>Centralized configuration across complex enterprise hardware.</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Central controller serves as a critical target/failure point.</li>
          <li>Requires specialized skills and compatible hardware.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Key Architectural Comparison Table</strong></h4>
<p class="lead mb-4">A high-level matrix evaluating core characteristics across primary network architectures:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Architecture</th>
      <th>Centralization Model</th>
      <th>Scalability</th>
      <th>Management Ease</th>
      <th>Typical Use Cases</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>P2P</strong></td>
      <td>Decentralized (or Partial)</td>
      <td>High (expands as nodes join)</td>
      <td>Complex (no central control)</td>
      <td>File-sharing networks, Blockchain</td>
    </tr>
    <tr>
      <td><strong>Client-Server</strong></td>
      <td>Centralized</td>
      <td>Moderate</td>
      <td>Easier (server-focused)</td>
      <td>Web sites, Email services</td>
    </tr>
    <tr>
      <td><strong>Hybrid</strong></td>
      <td>Partially Central</td>
      <td>Higher than Client-Server</td>
      <td>Complex (dual-management)</td>
      <td>VoIP, Video conferencing, Messaging</td>
    </tr>
    <tr>
      <td><strong>Cloud</strong></td>
      <td>Provider-Centralized</td>
      <td>Very High</td>
      <td>Easier (Outsourced infra)</td>
      <td>Cloud storage, SaaS, PaaS, IaaS</td>
    </tr>
    <tr>
      <td><strong>SDN</strong></td>
      <td>Centralized Control Plane</td>
      <td>High (Policy-driven)</td>
      <td>Moderate (Requires tools)</td>
      <td>Data centers, Enterprise backbones</td>
    </tr>
  </tbody>
</table>

<br />

### 1.7 Wireless Networks {#ch1.7-wireless-networks}

<h4 class="mb-2"><strong>&gt; Wireless Networks Overview</strong></h4>
<p class="lead mb-4">Wireless networking uses electromagnetic signals to establish high-speed connectivity across devices without physical cabling:</p>
<ul>
  <li><strong>Core Operational Mechanism:</strong> Transmits data packets over radio waves to deliver flexibility and rapid deployment.</li>
  <li><strong>Key Trade-Offs:</strong> Trades the raw speed, lower latency, and physical security of wired media for mobility, easier installation, and scalable device onboarding.</li>
  <li><strong>Environmental Factors:</strong> Signal quality is subject to degradation from structural physical obstacles (walls), frequency congestion, and atmospheric interference.</li>
</ul>

<h4 class="mb-2"><strong>&gt; Wireless Infrastructure Components Table</strong></h4>
<p class="lead mb-4">An operational summary of hardware used to deliver wireless coverage and cellular connectivity:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Component / Technology</th>
      <th>Primary Function &amp; Architecture</th>
      <th>Key Features &amp; Limitations</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Wireless Router</strong></td>
      <td>Combines a network router (Layer 3 packet directing) with a Wireless Access Point (WAP) to broadcast local Wi-Fi coverage.</td>
      <td>Includes WAN ports (to modem/ISP), local LAN ports (wired endpoints), dynamic memory/processor, and signal antennas.</td>
    </tr>
    <tr>
      <td><strong>Mobile Hotspot</strong></td>
      <td>Shares a smartphone or mobile endpoint's cellular connection (4G/5G) via Wi-Fi to adjacent client devices.</td>
      <td>Provides short-range ad-hoc internet connectivity. Consumes high battery power and requires WPA/WPA2 password protection.</td>
    </tr>
    <tr>
      <td><strong>Cell Tower (Cell Site)</strong></td>
      <td>Houses antennas, transmitters, and receivers to create geographic coverage cells across a broader cellular network.</td>
      <td>
        Managed by Base Station Controllers (BSCs) to execute handoffs as devices move between cells. Connected to core networks via high-speed fiber or microwave backhaul.
        <ul>
          <li><strong>Macro Cells:</strong> High-power towers delivering extensive coverage across several kilometers (ideal for rural areas).</li>
          <li><strong>Micro / Small Cells:</strong> Low-power urban installations that fill high-density capacity and coverage gaps.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Wireless Frequency Bands Table</strong></h4>
<p class="lead mb-4">A direct comparison of standard radio frequency allocations and their physical trade-offs:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Frequency Band</th>
      <th>Wi-Fi Standards / Network Type</th>
      <th>Operational Characteristics &amp; Trade-Offs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>2.4 GHz</strong></td>
      <td>Legacy &amp; standard Wi-Fi (802.11b/g/n).</td>
      <td>Lower frequency that penetrates solid walls and structures better; provides longer physical range but suffers from lower data throughput and high interference (Bluetooth, microwaves).</td>
    </tr>
    <tr>
      <td><strong>5 GHz</strong></td>
      <td>Modern Wi-Fi standards (802.11a/n/ac/ax).</td>
      <td>Delivers significantly faster data throughput and lower congestion; restricted by shorter physical range and poorer wall penetration.</td>
    </tr>
    <tr>
      <td><strong>Cellular Bands</strong></td>
      <td>4G LTE and 5G cellular infrastructure.</td>
      <td>Ranges from low frequencies (700 MHz for broad reach) to mid-range (2.6 GHz) and high mmWave bands (28+ GHz for ultra-high speed over short distances).</td>
    </tr>
  </tbody>
</table>

<br />

### 1.8 Network Security {#ch1.8-network-security}

<h4 class="mb-2"><strong>&gt; Network Security &amp; CIA Triad Overview</strong></h4>
<p class="lead mb-4">Network security encompasses measures designed to protect data, applications, and system infrastructure while maintaining the CIA Triad:</p>
<ul>
  <li><strong>Confidentiality:</strong> Ensures data is accessible exclusively to authorized users.</li>
  <li><strong>Integrity:</strong> Guarantees that data remains accurate, complete, and unaltered during storage or transit.</li>
  <li><strong>Availability:</strong> Ensures network resources and services remain reliable and accessible when needed.</li>
</ul>

<h4 class="mb-2"><strong>&gt; Firewalls Architecture Table</strong></h4>
<p class="lead mb-4">Firewalls enforce access control lists (ACLs) to monitor and filter incoming and outgoing traffic based on predefined policy rules:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Firewall Type</th>
      <th>OSI Layer Scope</th>
      <th>Filtering Mechanics &amp; Capabilities</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Packet Filtering</strong></td>
      <td>Layer 3 (Network) &amp; Layer 4 (Transport)</td>
      <td>Examines basic packet headers (source/destination IP, source/destination port, protocol) without tracking session states.</td>
    </tr>
    <tr>
      <td><strong>Stateful Inspection</strong></td>
      <td>Layer 3 &amp; Layer 4</td>
      <td>Tracks the active state of network connections; automatically allows inbound traffic that matches an established outbound request.</td>
    </tr>
    <tr>
      <td><strong>Application Layer (Proxy)</strong></td>
      <td>Up to Layer 7 (Application)</td>
      <td>Inspects actual payload contents (e.g., HTTP request headers) to block malicious application-level patterns.</td>
    </tr>
    <tr>
      <td><strong>Next-Generation (NGFW)</strong></td>
      <td>Layers 3 through 7</td>
      <td>Combines stateful inspection with Deep Packet Inspection (DPI), built-in IDS/IPS capabilities, encrypted traffic inspection, and application control.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Intrusion Detection vs. Prevention Systems (IDS/IPS)</strong></h4>
<p class="lead mb-4">IDS/IPS solutions inspect traffic against known threat signatures or behavioral baselines to detect and handle malicious activity:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>System Type</th>
      <th>Operational Behavior</th>
      <th>Deployment Deployment Options</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>IDS (Intrusion Detection)</strong></td>
      <td>Monitors traffic passively; identifies malicious behavior or policy violations and generates alerts without dropping traffic.</td>
      <td rowspan="2">
        <ul>
          <li><strong>NIDS / NIPS:</strong> Network-based hardware/software sensors placed at strategic points (e.g., behind firewalls or in DMZs) to inspect passing network traffic.</li>
          <li><strong>HIDS / HIPS:</strong> Host-based agents installed directly on endpoints to monitor local logs, host traffic, and system state.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>IPS (Intrusion Prevention)</strong></td>
      <td>Monitors traffic inline; actively blocks or rejects detected malicious traffic in real time.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Analysis Methods &amp; Security Best Practices</strong></h4>
<p class="lead mb-4">Detection techniques and foundational security management strategies:</p>
<ul>
  <li><strong>Detection Techniques:</strong>
    <ul>
      <li><em>Signature-Based:</em> Matches traffic patterns against a database of known exploit signatures.</li>
      <li><em>Anomaly-Based:</em> Flags unexpected deviations from an established baseline of normal activity.</li>
    </ul>
  </li>
  <li><strong>Security Best Practices:</strong>
    <ul>
      <li><em>Least Privilege Policies:</em> Define firewall rules to restrict traffic to only necessary ports and IPs.</li>
      <li><em>Defense in Depth:</em> Layer multiple security barriers (Firewalls, IDS/IPS, WAF, endpoint protection) to eliminate single points of failure.</li>
      <li><em>Regular Updates &amp; Auditing:</em> Keep detection signatures and systems updated; continuously review log events and conduct periodic penetration testing.</li>
    </ul>
  </li>
</ul>

<br />

### 1.9 Data Flow Example {#ch1.9-data-flow-example}

<h4 class="mb-2"><strong>&gt; End-to-End Network Data Flow Overview</strong></h4>
<p class="lead mb-4">When a user accesses a website, data moves through an integrated end-to-end communication sequence across local hardware, addressing layers, external routing, and server processing:</p>
<ul>
  <li><strong>Local Onboarding:</strong> Connects to physical/wireless media and receives IP configuration.</li>
  <li><strong>Name Resolution &amp; Encapsulation:</strong> Resolves the domain to a Layer 3 target IP address and wraps application data down the OSI stack.</li>
  <li><strong>Boundary Translation &amp; Server Processing:</strong> Translates local private IP addresses to public IPs for WAN transit, passes firewall checks, and fetches remote web assets.</li>
  <li><strong>Return Delivery &amp; Rendering:</strong> Maps return packets back to the local host and unpackages payload headers layer-by-layer to render the final page.</li>
</ul>

<h4 class="mb-2"><strong>&gt; The 7-Step Internet Request Journey Table</strong></h4>
<p class="lead mb-4">A complete sequential breakdown of the request and response cycle when connecting to a remote website:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Phase</th>
      <th>Network Action</th>
      <th>Technical Mechanics &amp; Protocols Involved</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Accessing the Internet</strong></td>
      <td>Wireless Association &amp; Auth</td>
      <td>Laptop connects to home WLAN via SSID and authenticates using WPA2/WPA3 security credentials.</td>
    </tr>
    <tr>
      <td><strong>2. Local IP Configuration</strong></td>
      <td>DHCP Lease Allocation</td>
      <td>Laptop sends a DHCP request to the router to receive a private IP (e.g., <code>192.168.1.10</code>), subnet mask, default gateway, and DNS server addresses.</td>
    </tr>
    <tr>
      <td><strong>3. DNS Resolution</strong></td>
      <td>Domain Translation</td>
      <td>Client sends a DNS query to convert domain name <code>www.example.com</code> into a target Layer 3 IP address (e.g., <code>93.184.216.34</code>).</td>
    </tr>
    <tr>
      <td><strong>4. Data Encapsulation &amp; LAN Delivery</strong></td>
      <td>Layer-by-Layer Formatting</td>
      <td>
        The request is encapsulated down the stack before being sent to the local gateway:
        <ul>
          <li><strong>Application:</strong> Builds raw HTTP/HTTPS request payload.</li>
          <li><strong>Transport:</strong> Wraps data in a TCP segment specifying destination port 80 or 443.</li>
          <li><strong>Network (Internet):</strong> Adds source private IP (<code>192.168.1.10</code>) and target IP (<code>93.184.216.34</code>) headers.</li>
          <li><strong>Data Link:</strong> Resolves gateway MAC address via ARP table and encapsulates packet into a Wi-Fi/Ethernet frame targeting the router's physical MAC address.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>5. NAT &amp; WAN Routing</strong></td>
      <td>IP Header Translation</td>
      <td>The router replaces the private source IP with its public IP (e.g., <code>203.0.113.45</code>) via Network Address Translation (NAT) and forwards the packet across ISP routers to the destination IP.</td>
    </tr>
    <tr>
      <td><strong>6. Server Processing &amp; Response</strong></td>
      <td>Inbound Filtering &amp; Fulfillment</td>
      <td>Destination firewall inspects traffic on port 80/443. The web server (Apache/Nginx/IIS) processes the request, builds HTML/CSS response assets, and routes packets back across the internet targeting the router's public IP.</td>
    </tr>
    <tr>
      <td><strong>7. Decapsulation &amp; Display</strong></td>
      <td>Payload Rendering</td>
      <td>The router uses its NAT table to translate the destination back to the laptop's private IP. The client receives the frame, strips away the Data Link, IP, and TCP headers layer-by-layer, and delivers the application data to the browser to display the webpage.</td>
    </tr>
  </tbody>
</table>

<br />


## 2. Introduction to Networking {#ch2}

<br />

### 2.1 Network Types {#ch2.1-network-types}

<h4 class="mb-2"><strong>&gt; Network Types</strong></h4>
<p class="lead mb-4">Networks are categorized by geographical scale, accessibility, and architectural purpose:</p>
<ul>
  <li><strong>Geographical Scale:</strong> Ranges from personal short-range connections (PAN) to worldwide global infrastructure (GAN).</li>
  <li><strong>Addressing & Protocols:</strong> Local networks (LAN) rely primarily on private RFC 1918 IP addresses, whereas wide networks (WAN) use internet-routable addresses and protocols like BGP.</li>
  <li><strong>Virtual Extension:</strong> Virtual Private Networks (VPNs) overlay existing physical networks to securely bridge remote clients or entire sites.</li>
</ul>

<table class="default-table">
  <thead>
    <tr>
      <th>Network Type</th>
      <th>Abbreviation</th>
      <th>Primary Definition &amp; Characteristics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Personal Area Network / Wireless PAN</strong></td>
      <td>PAN / WPAN</td>
      <td>Ad-hoc networks spanning a few meters for personal devices. WPAN uses technologies like Bluetooth (Piconets), ZigBee, and Z-Wave for low-power IoT and home automation.</td>
    </tr>
    <tr>
      <td><strong>Local Area Network</strong></td>
      <td>LAN</td>
      <td>Internal networks (home, office, school) providing high-speed communication across a limited area. Typically uses private IP ranges (RFC 1918).</td>
    </tr>
    <tr>
      <td><strong>Wireless Local Area Network</strong></td>
      <td>WLAN</td>
      <td>A LAN that uses wireless signals (Wi-Fi) instead of physical cables to transmit data. Shares identical IP routing concepts with a standard LAN.</td>
    </tr>
    <tr>
      <td><strong>Metropolitan Area Network</strong></td>
      <td>MAN</td>
      <td>High-speed regional broadband network connecting multiple LANs across a city or metropolitan area via leased fiber optic lines and high-performance routers.</td>
    </tr>
    <tr>
      <td><strong>Wide Area Network</strong></td>
      <td>WAN</td>
      <td>Large network formed by joining multiple LANs over broad geographical distances. Most commonly refers to the public Internet, but can also exist as private internal enterprise networks (Intranets/Airgaps). Uses routing protocols like BGP.</td>
    </tr>
    <tr>
      <td><strong>Global Area Network</strong></td>
      <td>GAN</td>
      <td>Worldwide network infrastructure spanning multiple WANs, interconnected using international undersea fiber-optic cables or satellite transmissions.</td>
    </tr>
    <tr>
      <td><strong>Virtual Private Network</strong></td>
      <td>VPN</td>
      <td>
        Encrypted network layer operating over public/private infrastructure to grant remote access or join networks. Common variants:
        <ul>
          <li><strong>Site-to-Site:</strong> Connects entire network ranges using network appliances (routers/firewalls).</li>
          <li><strong>Remote Access:</strong> Creates a virtual interface on a client machine (e.g., OpenVPN). Can be <em>Full-Tunnel</em> or <em>Split-Tunnel</em>.</li>
          <li><strong>SSL VPN:</strong> Clientless access executed directly inside a web browser to stream apps or desktop sessions (e.g., HTB Pwnbox).</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<br />

### 2.2 Networking Topologies {#ch2.2-networking-topologies}

<h4 class="mb-2"><strong>&gt; Networking Topologies</strong></h4>
<p class="lead mb-4">A network topology defines how devices are physically interconnected and logically communicate across a network structure:</p>
<ul>
  <li><strong>Physical vs. Logical Topology:</strong> Physical topology refers to the actual layout of cables, nodes, and hardware positions. Logical topology defines how data signals and packets travel across the media between devices.</li>
  <li><strong>Core Pillars:</strong> Networks are built upon three main structural elements: connections (media), nodes (processing and distribution points), and structural classifications (topology shapes).</li>
</ul>

<h4 class="mb-2"><strong>&gt; Network Building Blocks</strong></h4>
<p class="lead mb-4">The physical and functional elements that make up network architectures:</p>
<ul>
  <li><strong>Connections (Transmission Media):</strong>
    <ul>
      <li><em>Wired:</em> Coaxial cabling, Twisted-pair cabling, Glass fiber cabling.</li>
      <li><em>Wireless:</em> Wi-Fi, Cellular, Satellite.</li>
    </ul>
  </li>
  <li><strong>Nodes (Network Hardware):</strong> Transmission medium connection points used to send, receive, or route data signals (NICs, Repeaters, Hubs, Bridges, Switches, Routers, Gateways, Firewalls).</li>
</ul>

<h4 class="mb-2"><strong>&gt; Basic Topology Classifications Table</strong></h4>
<p class="lead mb-4">A breakdown of the eight fundamental network topology types, their connection mechanisms, and operational characteristics:</p>

```txt
1. POINT-TO-POINT                           2. BUS
+---+          +---+                        +---+       +---+       +---+
| A |--------->| B |                        | A |       | B |       | C |
+---+          +---+                        +-+-+       +-+-+       +-+-+
                                              |           |           |
                                    ==========+===========+===========+========== (Backbone)

------------------------------------------------------------------------------------

3. STAR                                     4. RING
       +---+   +---+                                +---+         +---+
        \ /                                         | A | ------> | B |
      +--v--+                                       +---+         +---+
      | HUB |                                         ^             |
      +--^--+                                         |             v
        / \                                         +---+ <------ +---+
       +---+   +---+                                | D |         | C |
                                                    +---+         +---+

------------------------------------------------------------------------------------

5. MESH (FULL)                              6. TREE
       +---+ ------- +---+                                  +------+
       | A |         | B |                                  | ROOT |
       +---+ \     / +---+                                  +--+---+
        |     \   /    |                                       /    \
        |      \ /     |                                 +----+      +----+
        |       X      |                                 | HUB|      | HUB|
        |      / \     |                                 +--+-+      +--+-+
       +---+ /     \ +---+                                 /  \        /  \
       | C | ------- | D |                               +---+ +---+ +---+ +---+
       +---+         +---+                               | A | | B | | C | | D |
                                                         +---+ +---+ +---+ +---+

------------------------------------------------------------------------------------

7. HYBRID (STAR-BUS)                        8. DAISY CHAIN
  +---+   +---+       +---+   +---+         +---+       +---+       +---+       +---+
   \ /     \ /         \ /     \ /          | A | <---> | B | <---> | C | <---> | D |
  +-v-+   +-v-+       +-v-+   +-v-+         +---+       +---+       +---+       +---+
  | HUB 1 |           | HUB 2 |
  +---+---+           +---+---+
      |                   |
======+===================+====== (Backbone)
```

<table class="default-table">
  <thead>
    <tr>
      <th>Topology Type</th>
      <th>Structure Description</th>
      <th>Key Characteristics &amp; Use Cases</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Point-to-Point</strong></td>
      <td>Direct connection between exactly two hosts.</td>
      <td>Simplest topology with a dedicated link. Used in traditional telephony and direct host links; distinct from P2P architecture.</td>
    </tr>
    <tr>
      <td><strong>Bus</strong></td>
      <td>All hosts connect to a single shared transmission medium (e.g., coaxial cable) without a central controller.</td>
      <td>Shared channel where only one host can transmit at a time while others receive/evaluate. No central hardware dependencies.</td>
    </tr>
    <tr>
      <td><strong>Star</strong></td>
      <td>Each host connects individually via a separate link to a central network component (switch, router, or hub).</td>
      <td>The central component handles all forwarding functions. Highly popular, though high traffic load centers on the hub device.</td>
    </tr>
    <tr>
      <td><strong>Ring</strong></td>
      <td>Devices are connected in a circular loop, each with one incoming and one outgoing connection.</td>
      <td>Data travels sequentially in one direction, often using a token-passing protocol. Can be built physically or simulated logically over a star topology.</td>
    </tr>
    <tr>
      <td><strong>Mesh</strong></td>
      <td>Nodes have redundant connections to multiple or all other nodes (Fully Meshed or Partially Meshed).</td>
      <td>High reliability and fault tolerance. Widely used in MANs and WANs so traffic can re-route automatically if a router or node fails.</td>
    </tr>
    <tr>
      <td><strong>Tree</strong></td>
      <td>An extended star structure arranged in a hierarchy (e.g., structured cabling with hub levels).</td>
      <td>Ideal for large enterprise networks, multi-story buildings, and broadband city networks (MANs). Uses logical spanning tree controls.</td>
    </tr>
    <tr>
      <td><strong>Hybrid</strong></td>
      <td>Interconnection of two or more completely different basic topologies (e.g., connecting a star network to a bus network).</td>
      <td>Flexible architecture combining different standard topologies to suit specialized operational environments.</td>
    </tr>
    <tr>
      <td><strong>Daisy Chain</strong></td>
      <td>Nodes connected sequentially in a series, placing a cable directly from one node to the next.</td>
      <td>Simple physical layout where signals pass through intermediate nodes to reach a destination. Commonly used in automation (e.g., CAN bus).</td>
    </tr>
  </tbody>
</table>

<br />

### 2.3 Proxies {#ch2.3-proxies}

<h4 class="mb-2"><strong>&gt; Proxies</strong></h4>
<p class="lead mb-4">A proxy is a mediator service operating primarily at Layer 7 of the OSI model that sits between connections to inspect, filter, or relay network traffic:</p>
<ul>
  <li><strong>Proxy vs. Gateway:</strong> A device is strictly a proxy if it can inspect the contents of the traffic passing through it. Without content inspection, it functions merely as a gateway.</li>
  <li><strong>Proxy vs. VPN:</strong> Misconceptions often confuse IP changes with proxies. A standard VPN changes an IP address by routing traffic, whereas a proxy actively mediates and inspects upper-layer application requests.</li>
</ul>

<h4 class="mb-2"><strong>&gt; Primary Proxy Types Table</strong></h4>
<p class="lead mb-4">A summary of standard proxy architectures, their primary directions, and key security operational roles:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Proxy Type</th>
      <th>Direction &amp; Target</th>
      <th>Key Characteristics &amp; Security Applications</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Forward Proxy (Dedicated)</strong></td>
      <td>Filters outbound traffic from client to internet.</td>
      <td>
        Acts on behalf of internal clients to carry out web requests. 
        <ul>
          <li><strong>Defensive Use:</strong> Restricts direct internet access on sensitive corporate networks, forcing malware to be proxy-aware to communicate outward (e.g., bypassing WinSock vs libcurl/Firefox differences).</li>
          <li><strong>Example Tools:</strong> Web filters, Burp Suite (when forwarding HTTP traffic).</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>Reverse Proxy</strong></td>
      <td>Filters inbound traffic from internet to internal servers.</td>
      <td>
        Protects backend services by listening publicly and relaying requests inward.
        <ul>
          <li><strong>Defensive Use:</strong> DDoS protection, load balancing, and Web Application Firewalls (WAF) to inspect/block malicious web requests.</li>
          <li><strong>Offensive/PenTest Use:</strong> Evasive routing through infected endpoints or SSH tunnels to bypass perimeter firewalls and IDS controls.</li>
          <li><strong>Example Tools:</strong> Cloudflare, ModSecurity WAF.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Interception Modes</strong></h4>
<p class="lead mb-4">Proxies operate under two distinct client visibility modes:</p>
<ul>
  <li><strong>Transparent Proxy:</strong> Intercepts client communications without client knowledge or special software settings. To external systems, it acts as the primary communication endpoint.</li>
  <li><strong>Non-Transparent Proxy:</strong> Requires explicit configuration on the client machine/browser (e.g., system proxy settings). If misconfigured or unconfigured, external network communication is blocked.</li>
</ul>

<br />

### 2.4 Network Layer {#ch2.4-network-layer}

<h4 class="mb-2"><strong>&gt; Network Layer (OSI Layer 3) Overview</strong></h4>
<p class="lead mb-4">The Network Layer controls data packet exchange and routing across intermediate nodes to ensure cross-subnet delivery:</p>
<ul>
  <li><strong>Core Responsibilities:</strong> Handles logical addressing and routing packet data from source to target hosts without processing upper-layer payloads at intermediate routers.</li>
  <li><strong>Key Layer 3 Protocols:</strong> Includes IPv4/IPv6, IPsec, ICMP, IGMP, RIP, and OSPF.</li>
  <li><strong>Addressing Analogy:</strong> While a MAC address identifies a host within a single local network (like an apartment number), an IP address provides a globally or logically routable address (like a postal street address).</li>
</ul>

<br />

### 2.5 IPv4 Addresses {#ch2.5-ipv4-addresses}

<h4 class="mb-2"><strong>&gt; Legacy IPv4 Class Structure Table</strong></h4>
<p class="lead mb-4">The historical division of 32-bit IPv4 addresses into fixed network/host classes:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Class</th>
      <th>Network Address Range</th>
      <th>Subnet Mask</th>
      <th>CIDR</th>
      <th>Subnets Count</th>
      <th>Usable Hosts / Class Total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Class A</strong></td>
      <td><code>1.0.0.0</code> – <code>127.255.255.255</code></td>
      <td><code>255.0.0.0</code></td>
      <td><code>/8</code></td>
      <td>127</td>
      <td>16,777,214 (+2 reserved)</td>
    </tr>
    <tr>
      <td><strong>Class B</strong></td>
      <td><code>128.0.0.0</code> – <code>191.255.255.255</code></td>
      <td><code>255.255.0.0</code></td>
      <td><code>/16</code></td>
      <td>16,384</td>
      <td>65,534 (+2 reserved)</td>
    </tr>
    <tr>
      <td><strong>Class C</strong></td>
      <td><code>192.0.0.0</code> – <code>223.255.255.255</code></td>
      <td><code>255.255.255.0</code></td>
      <td><code>/24</code></td>
      <td>2,097,152</td>
      <td>254 (+2 reserved)</td>
    </tr>
    <tr>
      <td><strong>Class D</strong></td>
      <td><code>224.0.0.0</code> – <code>239.255.255.255</code></td>
      <td>Multicast</td>
      <td>Multicast</td>
      <td>Multicast</td>
      <td>Multicast</td>
    </tr>
    <tr>
      <td><strong>Class E</strong></td>
      <td><code>240.0.0.0</code> – <code>255.255.255.255</code></td>
      <td>Reserved</td>
      <td>Reserved</td>
      <td>Reserved</td>
      <td>Reserved</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Addressing Components &amp; Binary Notation</strong></h4>
<p class="lead mb-4">How 32-bit dotted-decimal IPv4 addresses, subnet masks, and CIDR representations work:</p>
<ul>
  <li><strong>Reserved Network Addresses:</strong> Two IP addresses in every subnet are unavailable for host assignment: the first address (Network Address) and the last address (Broadcast Address).</li>
  <li><strong>Default Gateway:</strong> The router address connecting local networks to external systems, traditionally assigned the first or last usable IP in a subnet.</li>
  <li><strong>CIDR (Classless Inter-Domain Routing):</strong> Replaces rigid class divisions using a suffix (e.g., <code>/24</code>) that denotes the exact count of leading <code>1</code>-bits in the subnet mask assigned to the network portion.</li>
</ul>

<p class="lead mb-4">Binary conversion example for IP <code>192.168.10.39</code> with mask <code>255.255.255.0</code> (<code>/24</code>):</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Component</th>
      <th>1st Octet</th>
      <th>2nd Octet</th>
      <th>3rd Octet</th>
      <th>4th Octet</th>
      <th>Combined Notation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>IP (Binary)</strong></td>
      <td><code>11000000</code></td>
      <td><code>10101000</code></td>
      <td><code>00001010</code></td>
      <td><code>00100111</code></td>
      <td><code>192.168.10.39</code></td>
    </tr>
    <tr>
      <td><strong>Mask (Binary)</strong></td>
      <td><code>11111111</code></td>
      <td><code>11111111</code></td>
      <td><code>11111111</code></td>
      <td><code>00000000</code></td>
      <td><code>255.255.255.0</code></td>
    </tr>
    <tr>
      <td><strong>CIDR Summary</strong></td>
      <td colspan="4">24 leading <code>1</code>-bits in the subnet mask</td>
      <td><code>192.168.10.39/24</code></td>
    </tr>
  </tbody>
</table>

<br />

### 2.5 Subnetting {#ch2.6-subnetting}

<h4 class="mb-2"><strong>&gt; Subnetting Concepts Overview</strong></h4>
<p class="lead mb-4">Subnetting divides an IPv4 network address range into smaller logical segments:</p>
<ul>
  <li><strong>Subnet Purpose:</strong> Groups hosts using the same network prefix to optimize traffic, enforce routing boundaries, and enhance security.</li>
  <li><strong>Network vs. Host Boundary:</strong> The subnet mask fixes the 1-bits to define the network, while 0-bits define host addresses.</li>
  <li><strong>Reserved Boundary Addresses:</strong> Setting host bits to all <code>0</code>s yields the Network Address, while setting host bits to all <code>1</code>s yields the Broadcast Address. Usable host addresses fall strictly between these two boundaries.</li>
</ul>

<h4 class="mb-2"><strong>&gt; Primary Example: Subnetting 192.168.12.160/26</strong></h4>
<p class="lead mb-4">Analyzing the network parameters for <code>192.168.12.160/26</code> with mask <code>255.255.255.192</code>:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Address Role</th>
      <th>Binary Representation (4th Octet)</th>
      <th>IPv4 Decimal Address</th>
      <th>Usage Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Network Address</strong></td>
      <td><code>10|000000</code></td>
      <td><code>192.168.12.128</code></td>
      <td>Subnet identifier; setting all 6 host bits to 0.</td>
    </tr>
    <tr>
      <td><strong>First Host</strong></td>
      <td><code>10|000001</code></td>
      <td><code>192.168.12.129</code></td>
      <td>First assignable host IP address.</td>
    </tr>
    <tr>
      <td><strong>Last Host</strong></td>
      <td><code>10|111110</code></td>
      <td><code>192.168.12.190</code></td>
      <td>Last assignable host IP address.</td>
    </tr>
    <tr>
      <td><strong>Broadcast Address</strong></td>
      <td><code>10|111111</code></td>
      <td><code>192.168.12.191</code></td>
      <td>Subnet broadcast target; setting all 6 host bits to 1.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Sub-Subnetting: Dividing 192.168.12.128/26 into 4 Networks</strong></h4>
<p class="lead mb-4">Dividing a 64-host <code>/26</code> block into 4 equal subnets by expanding the mask by 2 bits (2^2 = 4) to <code>/28</code> (<code>255.255.255.240</code>):</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Subnet #</th>
      <th>Network Address</th>
      <th>First Usable Host</th>
      <th>Last Usable Host</th>
      <th>Broadcast Address</th>
      <th>CIDR Prefix</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1</strong></td>
      <td><code>192.168.12.128</code></td>
      <td><code>192.168.12.129</code></td>
      <td><code>192.168.12.142</code></td>
      <td><code>192.168.12.143</code></td>
      <td><code>192.168.12.128/28</code></td>
    </tr>
    <tr>
      <td><strong>2</strong></td>
      <td><code>192.168.12.144</code></td>
      <td><code>192.168.12.145</code></td>
      <td><code>192.168.12.158</code></td>
      <td><code>192.168.12.159</code></td>
      <td><code>192.168.12.144/28</code></td>
    </tr>
    <tr>
      <td><strong>3</strong></td>
      <td><code>192.168.12.160</code></td>
      <td><code>192.168.12.161</code></td>
      <td><code>192.168.12.174</code></td>
      <td><code>192.168.12.175</code></td>
      <td><code>192.168.12.160/28</code></td>
    </tr>
    <tr>
      <td><strong>4</strong></td>
      <td><code>192.168.12.176</code></td>
      <td><code>192.168.12.177</code></td>
      <td><code>192.168.12.190</code></td>
      <td><code>192.168.12.191</code></td>
      <td><code>192.168.12.176/28</code></td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Mental Subnetting Reference Table</strong></h4>
<p class="lead mb-4">Determining block sizes using borrowed subnet bits within an octet (CIDR prefix mod 8). Block size is calculated as 2<sup>(8 &minus; remainder)</sup> or by dividing 256 in half for each borrowed bit:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Remainder (Modulo 8)</th>
      <th>Subnet Block Size</th>
      <th>Exponential Calculation</th>
      <th>Division Method</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>0</strong></td>
      <td>256</td>
      <td>2^8</td>
      <td>256</td>
    </tr>
    <tr>
      <td><strong>1</strong></td>
      <td>128</td>
      <td>2^7</td>
      <td>256 / 2</td>
    </tr>
    <tr>
      <td><strong>2</strong></td>
      <td>64</td>
      <td>2^6</td>
      <td>256 / 2 / 2</td>
    </tr>
    <tr>
      <td><strong>3</strong></td>
      <td>32</td>
      <td>2^5</td>
      <td>256 / 2 / 2 / 2</td>
    </tr>
    <tr>
      <td><strong>4</strong></td>
      <td>16</td>
      <td>2^4</td>
      <td>256 / 2 / 2 / 2 / 2</td>
    </tr>
    <tr>
      <td><strong>5</strong></td>
      <td>8</td>
      <td>2^3</td>
      <td>256 / 2 / 2 / 2 / 2 / 2</td>
    </tr>
    <tr>
      <td><strong>6</strong></td>
      <td>4</td>
      <td>2^2</td>
      <td>256 / 2 / 2 / 2 / 2 / 2 / 2</td>
    </tr>
    <tr>
      <td><strong>7</strong></td>
      <td>2</td>
      <td>2^1</td>
      <td>256 / 2 / 2 / 2 / 2 / 2 / 2 / 2</td>
    </tr>
  </tbody>
</table>

<br />

### 2.7 MAC Addresses {#ch2.7-mac-addresses}

<h4 class="mb-2"><strong>&gt; Media Access Control (MAC) Addresses Overview</strong></h4>
<p class="lead mb-4">A MAC address is a 48-bit (6 octet) hardware identifier assigned to network interface controllers (NICs) to deliver Layer 2 frames within local networks:</p>
<ul>
  <li><strong>Standards &amp; Format:</strong> Governed by IEEE standards (Ethernet 802.3, Wi-Fi 802.11, Bluetooth 802.15) and written in hexadecimal (e.g., <code>DE:AD:BE:EF:13:37</code>).</li>
  <li><strong>Subnet Forwarding:</strong> Frames heading to a host in the same subnet deliver directly to the target MAC; frames bound for external subnets deliver to the router's (default gateway's) MAC.</li>
</ul>

<h4 class="mb-2"><strong>&gt; MAC Address Structure Table</strong></h4>
<p class="lead mb-4">A functional breakdown of the 48-bit MAC address field components:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Section / Bit Indicator</th>
      <th>Bit Span</th>
      <th>Description &amp; Operational Function</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Organizational Unique Identifier (OUI)</strong></td>
      <td>First 3 Bytes (24 Bits)</td>
      <td>Vendor code assigned by the IEEE to hardware manufacturers.</td>
    </tr>
    <tr>
      <td><strong>Network Interface Controller (NIC)</strong></td>
      <td>Last 3 Bytes (24 Bits)</td>
      <td>Individual device identifier assigned uniquely by the manufacturer.</td>
    </tr>
    <tr>
      <td><strong>Unicast vs. Multicast Bit</strong></td>
      <td>1st Octet, Least Significant Bit (Bit 0)</td>
      <td>
        <ul>
          <li><code>0</code> = Unicast (Targeted directly to a single host interface).</li>
          <li><code>1</code> = Multicast (Targeted to a group of hosts; e.g., <code>01:00:5E:...</code>).</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>Global vs. Local Bit</strong></td>
      <td>1st Octet, Second Least Significant Bit (Bit 1)</td>
      <td>
        <ul>
          <li><code>0</code> = Globally Unique OUI (IEEE vendor managed).</li>
          <li><code>1</code> = Locally Administrated (Overridden or software-defined).</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><strong>Broadcast Address</strong></td>
      <td>All 48 Bits set to 1</td>
      <td><code>FF:FF:FF:FF:FF:FF</code>; broadcasts to all network participants simultaneously.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Address Resolution Protocol (ARP) &amp; Attacks</strong></h4>
<p class="lead mb-4">ARP resolves Layer 3 IP addresses into Layer 2 MAC addresses on local subnets.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Process / Attack Vector</th>
      <th>Operation Type</th>
      <th>Technical Details &amp; Operational Impact</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>ARP Request</strong></td>
      <td>Resolution Phase</td>
      <td>Broadcast message asking "Who has IP X.X.X.X? Tell IP Y.Y.Y.Y" sent to <code>FF:FF:FF:FF:FF:FF</code>.</td>
    </tr>
    <tr>
      <td><strong>ARP Reply</strong></td>
      <td>Resolution Phase</td>
      <td>Unicast response stating "IP X.X.X.X is at MAC AA:AA:AA:...".</td>
    </tr>
    <tr>
      <td><strong>MAC Spoofing</strong></td>
      <td>Attack Vector</td>
      <td>Altering a network interface MAC to impersonate another device or bypass filtering rules.</td>
    </tr>
    <tr>
      <td><strong>MAC Flooding</strong></td>
      <td>Attack Vector</td>
      <td>Flooding a network switch with randomized MACs to exhaust its MAC table capacity.</td>
    </tr>
    <tr>
      <td><strong>ARP Spoofing / Poisoning</strong></td>
      <td>Attack Vector</td>
      <td>Transmitting spoofed ARP replies to link the attacker's MAC address with a target IP (like the default gateway), facilitating Man-In-The-Middle (MITM) attacks.</td>
    </tr>
  </tbody>
</table>

<br />

### 2.8 IPv6 Addresses {#ch2.8-ipv6-addresses}

<h4 class="mb-2"><strong>&gt; IPv6 Addresses Overview</strong></h4>
<p class="lead mb-4">IPv6 is the 128-bit successor to IPv4, designed to eliminate address space exhaustion and improve routing efficiency:</p>
<ul>
  <li><strong>Core Architecture:</strong> Uses 128-bit addressing to deliver approximately 340 undecillion addresses, eliminating the strict necessity of NAT.</li>
  <li><strong>Multi-Addressing &amp; Configuration:</strong> An interface can hold multiple IPv6 addresses simultaneously and configure addresses dynamically using Stateless Address Autoconfiguration (SLAAC) or DHCPv6.</li>
  <li><strong>Dual Stack:</strong> Supports running IPv4 and IPv6 concurrently on the same network infrastructure during transition periods.</li>
</ul>

<h4 class="mb-2"><strong>&gt; IPv4 vs. IPv6 Technical Comparison Table</strong></h4>
<p class="lead mb-4">A direct functional comparison of key characteristics between IPv4 and IPv6:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>IPv4</th>
      <th>IPv6</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Bit Length</strong></td>
      <td>32 bits</td>
      <td>128 bits</td>
    </tr>
    <tr>
      <td><strong>Address Pool</strong></td>
      <td>~4.3 billion</td>
      <td>~340 undecillion</td>
    </tr>
    <tr>
      <td><strong>Notation Format</strong></td>
      <td>Dotted Decimal (e.g., <code>10.10.10.0/24</code>)</td>
      <td>Hexadecimal (e.g., <code>fe80::dd80:b1a9:6687:2d3b/64</code>)</td>
    </tr>
    <tr>
      <td><strong>Dynamic Configuration</strong></td>
      <td>DHCP</td>
      <td>SLAAC / DHCPv6</td>
    </tr>
    <tr>
      <td><strong>IPsec Integration</strong></td>
      <td>Optional</td>
      <td>Mandatory</td>
    </tr>
    <tr>
      <td><strong>Multi-Target Traffic</strong></td>
      <td>Unicast, Multicast, Broadcast</td>
      <td>Unicast, Multicast, Anycast (Broadcast is eliminated)</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; IPv6 Address Types &amp; Structure</strong></h4>
<p class="lead mb-4">IPv6 addresses decouple into functional target categories and distinct structural components:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>Type / Component</th>
      <th>Description &amp; Rules</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="3"><strong>Address Types</strong></td>
      <td><strong>Unicast</strong></td>
      <td>Identifies a single interface.</td>
    </tr>
    <tr>
      <td><strong>Anycast</strong></td>
      <td>Assigned to multiple interfaces; packets deliver to the nearest single interface.</td>
    </tr>
    <tr>
      <td><strong>Multicast</strong></td>
      <td>Assigned to multiple interfaces; packets deliver to all interfaces in the group. Replaces broadcast.</td>
    </tr>
    <tr>
      <td rowspan="2"><strong>Structural Parts</strong></td>
      <td><strong>Network Prefix</strong></td>
      <td>Identifies the network or subnet (commonly <code>/64</code>, <code>/48</code>, or <code>/56</code>).</td>
    </tr>
    <tr>
      <td><strong>Interface Identifier</strong></td>
      <td>Identifies the host interface (64-bit suffix).</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Hexadecimal Notation &amp; RFC 5952 Compression Rules</strong></h4>
<p class="lead mb-4">Formatting guidelines for 128-bit IPv6 hexadecimal representation:</p>
<ul>
  <li><strong>Group Format:</strong> Consists of 8 blocks of 4 hexadecimal characters (16 bits per block) separated by colons.</li>
  <li><strong>RFC 5952 Rule 1:</strong> Use lowercase characters for all hexadecimal letters.</li>
  <li><strong>RFC 5952 Rule 2:</strong> Omit all leading zeros within a block (e.g., <code>:0000:</code> becomes <code>:0:</code>, <code>:0001:</code> becomes <code>:1:</code>).</li>
  <li><strong>RFC 5952 Rule 3:</strong> Replace one or more consecutive blocks of zeros with a double colon (<code>::</code>). This substitution can only be used once per address string.</li>
</ul>

<br />

### 2.9 Networking Key Technology {#ch2.9-networking-key-technology}

<h4 class="mb-2"><strong>&gt; Networking &amp; Security Terminology</strong></h4>
<p class="lead mb-4">A structured overview of core networking, security, and administrative protocols:</p>

<h4 class="mb-2"><strong>&gt; Protocols &amp; Technologies Table</strong></h4>

<table class="default-table">
  <thead>
    <tr>
      <th>Protocol / Technology</th>
      <th>Acronym</th>
      <th>Description &amp; Operational Function</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Wired Equivalent Privacy</strong></td>
      <td>WEP</td>
      <td>Legacy security protocol previously used to secure wireless networks.</td>
    </tr>
    <tr>
      <td><strong>Secure Shell</strong></td>
      <td>SSH</td>
      <td>Secure network protocol used to log in and execute commands on remote systems.</td>
    </tr>
    <tr>
      <td><strong>File Transfer Protocol</strong></td>
      <td>FTP</td>
      <td>Network protocol used to transfer files between systems.</td>
    </tr>
    <tr>
      <td><strong>Simple Mail Transfer Protocol</strong></td>
      <td>SMTP</td>
      <td>Protocol used for sending and receiving emails.</td>
    </tr>
    <tr>
      <td><strong>Hypertext Transfer Protocol</strong></td>
      <td>HTTP</td>
      <td>Client-server protocol used to send and receive web data over the internet.</td>
    </tr>
    <tr>
      <td><strong>Server Message Block</strong></td>
      <td>SMB</td>
      <td>Protocol used to share files, printers, and network resources.</td>
    </tr>
    <tr>
      <td><strong>Network File System</strong></td>
      <td>NFS</td>
      <td>Protocol used to access files over a network.</td>
    </tr>
    <tr>
      <td><strong>Simple Network Management Protocol</strong></td>
      <td>SNMP</td>
      <td>Protocol used to monitor and manage network devices.</td>
    </tr>
    <tr>
      <td><strong>Wi-Fi Protected Access</strong></td>
      <td>WPA</td>
      <td>Wireless security protocol using password protection to block unauthorized access.</td>
    </tr>
    <tr>
      <td><strong>Temporal Key Integrity Protocol</strong></td>
      <td>TKIP</td>
      <td>Wireless security protocol that is less secure than modern standards.</td>
    </tr>
    <tr>
      <td><strong>Network Time Protocol</strong></td>
      <td>NTP</td>
      <td>Synchronizes the system clocks of computers across a network.</td>
    </tr>
    <tr>
      <td><strong>Virtual Local Area Network</strong></td>
      <td>VLAN</td>
      <td>Method used to segment a network into multiple logical networks.</td>
    </tr>
    <tr>
      <td><strong>VLAN Trunking Protocol</strong></td>
      <td>VTP</td>
      <td>Layer 2 protocol used to manage VLAN configurations across multiple switches.</td>
    </tr>
    <tr>
      <td><strong>Routing Information Protocol</strong></td>
      <td>RIP</td>
      <td>Distance-vector routing protocol for LANs and WANs.</td>
    </tr>
    <tr>
      <td><strong>Open Shortest Path First</strong></td>
      <td>OSPF</td>
      <td>Interior Gateway Protocol (IGP) for routing traffic within a single Autonomous System (AS).</td>
    </tr>
    <tr>
      <td><strong>Interior Gateway Routing Protocol</strong></td>
      <td>IGRP</td>
      <td>Cisco proprietary interior gateway protocol designed for routing within autonomous systems.</td>
    </tr>
    <tr>
      <td><strong>Enhanced Interior Gateway Routing Protocol</strong></td>
      <td>EIGRP</td>
      <td>Advanced distance-vector routing protocol used for internal IP routing.</td>
    </tr>
    <tr>
      <td><strong>Pretty Good Privacy</strong></td>
      <td>PGP</td>
      <td>Encryption program used to secure emails, files, and data.</td>
    </tr>
    <tr>
      <td><strong>Network News Transfer Protocol</strong></td>
      <td>NNTP</td>
      <td>Protocol for distributing and retrieving newsgroup messages.</td>
    </tr>
    <tr>
      <td><strong>Cisco Discovery Protocol</strong></td>
      <td>CDP</td>
      <td>Cisco proprietary protocol to discover and manage connected Cisco devices.</td>
    </tr>
    <tr>
      <td><strong>Hot Standby Router Protocol</strong></td>
      <td>HSRP</td>
      <td>Cisco redundancy protocol providing failover protection for default gateways.</td>
    </tr>
    <tr>
      <td><strong>Virtual Router Redundancy Protocol</strong></td>
      <td>VRRP</td>
      <td>Protocol enabling automatic failover assignment of available IP routers to hosts.</td>
    </tr>
    <tr>
      <td><strong>Spanning Tree Protocol</strong></td>
      <td>STP</td>
      <td>Layer 2 network protocol preventing switching loops in Ethernet networks.</td>
    </tr>
    <tr>
      <td><strong>Terminal Access Controller Access-Control System</strong></td>
      <td>TACACS</td>
      <td>Centralized Authentication, Authorization, and Accounting (AAA) access protocol.</td>
    </tr>
    <tr>
      <td><strong>Session Initiation Protocol</strong></td>
      <td>SIP</td>
      <td>Signaling protocol for establishing and terminating real-time voice, video, and multimedia sessions.</td>
    </tr>
    <tr>
      <td><strong>Voice Over IP</strong></td>
      <td>VOIP</td>
      <td>Technology enabling voice calls over IP networks.</td>
    </tr>
    <tr>
      <td><strong>Extensible Authentication Protocol</strong></td>
      <td>EAP</td>
      <td>Authentication framework supporting methods like passwords, certificates, and public keys.</td>
    </tr>
    <tr>
      <td><strong>Lightweight Extensible Authentication Protocol</strong></td>
      <td>LEAP</td>
      <td>Cisco proprietary wireless authentication protocol derived from EAP.</td>
    </tr>
    <tr>
      <td><strong>Protected Extensible Authentication Protocol</strong></td>
      <td>PEAP</td>
      <td>Security protocol providing encrypted tunnels for authentication.</td>
    </tr>
    <tr>
      <td><strong>Systems Management Server</strong></td>
      <td>SMS</td>
      <td>Systems management solution to handle network, system, and device administration.</td>
    </tr>
    <tr>
      <td><strong>Microsoft Baseline Security Analyzer</strong></td>
      <td>MBSA</td>
      <td>Free Microsoft assessment tool used to detect security vulnerabilities.</td>
    </tr>
    <tr>
      <td><strong>Supervisory Control and Data Acquisition</strong></td>
      <td>SCADA</td>
      <td>Industrial control system used to monitor and control industrial operations.</td>
    </tr>
    <tr>
      <td><strong>Virtual Private Network</strong></td>
      <td>VPN</td>
      <td>Technology creating secure, encrypted connections over public networks.</td>
    </tr>
    <tr>
      <td><strong>Internet Protocol Security</strong></td>
      <td>IPsec</td>
      <td>Protocol suite used to provide encrypted communications and VPN tunnels.</td>
    </tr>
    <tr>
      <td><strong>Point-to-Point Tunneling Protocol</strong></td>
      <td>PPTP</td>
      <td>Legacy protocol used to create encrypted remote-access VPN tunnels.</td>
    </tr>
    <tr>
      <td><strong>Network Address Translation</strong></td>
      <td>NAT</td>
      <td>Translates private IP addresses to a single public IP address for internet access.</td>
    </tr>
    <tr>
      <td><strong>Carriage Return Line Feed</strong></td>
      <td>CRLF</td>
      <td>Control character sequence signaling end-of-line and line feed in text formats.</td>
    </tr>
    <tr>
      <td><strong>Asynchronous JavaScript and XML</strong></td>
      <td>AJAX</td>
      <td>Web technique for creating dynamic, asynchronous web content using JS and XML/JSON.</td>
    </tr>
    <tr>
      <td><strong>Internet Server Application Programming Interface</strong></td>
      <td>ISAPI</td>
      <td>API set used to develop performance-oriented web server extensions.</td>
    </tr>
    <tr>
      <td><strong>Uniform Resource Identifier</strong></td>
      <td>URI</td>
      <td>Syntax used to uniquely identify a resource on the internet.</td>
    </tr>
    <tr>
      <td><strong>Uniform Resource Locator</strong></td>
      <td>URL</td>
      <td>URI subset identifying a web resource along with its protocol and domain name.</td>
    </tr>
    <tr>
      <td><strong>Internet Key Exchange</strong></td>
      <td>IKE</td>
      <td>Protocol used to set up security associations, authentication, and encryption in VPNs.</td>
    </tr>
    <tr>
      <td><strong>Generic Routing Encapsulation</strong></td>
      <td>GRE</td>
      <td>Tunneling protocol used to encapsulate packet data across networks.</td>
    </tr>
    <tr>
      <td><strong>Remote Shell</strong></td>
      <td>RSH</td>
      <td>Unix command-line utility used to execute commands on remote hosts.</td>
    </tr>
  </tbody>
</table>

<br />

### 2.10 Common Protocols {#ch2.10-common-protocols}

<h4 class="mb-2"><strong>&gt; Transport Layer Protocols &amp; Common Ports</strong></h4>
<p class="lead mb-4">TCP and UDP form the backbone of Transport Layer communications, serving opposing speed vs. reliability requirements:</p>
<ul>
  <li><strong>Transmission Control Protocol (TCP):</strong> Connection-oriented, relying on a 3-Way Handshake to establish and maintain active sessions. Guarantees data delivery with trade-offs in speed and protocol overhead.</li>
  <li><strong>User Datagram Protocol (UDP):</strong> Connectionless protocol transmitting packets without checking receipt status. Prioritizes speed and minimal latency over absolute reliability.</li>
</ul>

<h4 class="mb-2"><strong>&gt; Transport Protocols Port Reference Table</strong></h4>
<p class="lead mb-4">A combined reference of notable TCP and UDP services, default port numbers, and core functions:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Protocol Name</th>
      <th>Acronym</th>
      <th>Default Port(s)</th>
      <th>Transport Protocol</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Secure Shell</strong></td>
      <td>SSH / SCP</td>
      <td>22</td>
      <td>TCP</td>
      <td>Secure remote login and file copying.</td>
    </tr>
    <tr>
      <td><strong>Telnet</strong></td>
      <td>TELNET</td>
      <td>23</td>
      <td>TCP / UDP</td>
      <td>Text-based remote login service.</td>
    </tr>
    <tr>
      <td><strong>Domain Name System</strong></td>
      <td>DNS</td>
      <td>53</td>
      <td>TCP / UDP</td>
      <td>Domain name to IP address resolution.</td>
    </tr>
    <tr>
      <td><strong>Dynamic Host Configuration Protocol</strong></td>
      <td>DHCP / BOOTP</td>
      <td>67, 68</td>
      <td>TCP / UDP</td>
      <td>Automated IP configuration and host bootstrapping.</td>
    </tr>
    <tr>
      <td><strong>Trivial File Transfer Protocol</strong></td>
      <td>TFTP</td>
      <td>69</td>
      <td>TCP / UDP</td>
      <td>Simple file transfer protocol.</td>
    </tr>
    <tr>
      <td><strong>Hypertext Transfer Protocol</strong></td>
      <td>HTTP</td>
      <td>80</td>
      <td>TCP</td>
      <td>Transfers web pages across the network.</td>
    </tr>
    <tr>
      <td><strong>Kerberos</strong></td>
      <td>Kerberos</td>
      <td>88</td>
      <td>TCP</td>
      <td>Network authentication and authorization.</td>
    </tr>
    <tr>
      <td><strong>Network Time Protocol</strong></td>
      <td>NTP</td>
      <td>123</td>
      <td>TCP / UDP</td>
      <td>Synchronizes computer clocks across networks.</td>
    </tr>
    <tr>
      <td><strong>Simple Network Management Protocol</strong></td>
      <td>SNMP</td>
      <td>161, 162</td>
      <td>TCP / UDP</td>
      <td>Manages and monitors network devices.</td>
    </tr>
    <tr>
      <td><strong>Hypertext Transfer Protocol Secure</strong></td>
      <td>HTTPS / SSL</td>
      <td>443</td>
      <td>TCP</td>
      <td>Encrypted web communications.</td>
    </tr>
    <tr>
      <td><strong>Internet Key Exchange / IPsec</strong></td>
      <td>IKE / IPsec</td>
      <td>500</td>
      <td>TCP / UDP</td>
      <td>Key exchange and secure VPN tunnel setup.</td>
    </tr>
    <tr>
      <td><strong>Routing Information Protocol</strong></td>
      <td>RIP</td>
      <td>520</td>
      <td>UDP</td>
      <td>Exchanges routing information between routers.</td>
    </tr>
    <tr>
      <td><strong>Syslog</strong></td>
      <td>SYSLOG</td>
      <td>514</td>
      <td>UDP</td>
      <td>Collects and stores log messages.</td>
    </tr>
    <tr>
      <td><strong>Microsoft SQL Server</strong></td>
      <td>MS-SQL</td>
      <td>1433 (TCP), 1434 (UDP)</td>
      <td>TCP / UDP</td>
      <td>MS SQL database connection (1433) &amp; Browser Service (1434).</td>
    </tr>
    <tr>
      <td><strong>Remote Desktop Protocol / Terminal Server</strong></td>
      <td>RDP / TS</td>
      <td>3389</td>
      <td>TCP / UDP</td>
      <td>Graphical remote desktop access.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Internet Control Message Protocol (ICMP)</strong></h4>
<p class="lead mb-4">ICMP operates across IPv4 (ICMPv4) and IPv6 (ICMPv6) for diagnostic, status, and error messaging:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>ICMP Category</th>
      <th>Type / Field</th>
      <th>Functional Purpose &amp; Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="3"><strong>Requests</strong></td>
      <td>Echo Request</td>
      <td>Tests device reachability (e.g., <code>ping</code>, <code>traceroute</code>).</td>
    </tr>
    <tr>
      <td>Timestamp Request</td>
      <td>Queries system time on a remote host.</td>
    </tr>
    <tr>
      <td>Address Mask Request</td>
      <td>Requests the target's subnet mask.</td>
    </tr>
    <tr>
      <td rowspan="4"><strong>Messages</strong></td>
      <td>Echo Reply</td>
      <td>Response returned after receiving an Echo Request.</td>
    </tr>
    <tr>
      <td>Destination Unreachable</td>
      <td>Returned when a packet cannot be delivered to its target.</td>
    </tr>
    <tr>
      <td>Time Exceeded</td>
      <td>Issued when a packet's Time-To-Live (TTL) reaches 0.</td>
    </tr>
    <tr>
      <td>Redirect / Parameter Problem</td>
      <td>Informs host of alternate routes or header errors.</td>
    </tr>
    <tr>
      <td rowspan="3"><strong>OS Fingerprinting (Default TTLs)</strong></td>
      <td>Windows (TTL 128)</td>
      <td>Default TTL typically set to 128 (e.g., ping reply TTL ~122 = 6 hops away).</td>
    </tr>
    <tr>
      <td>Linux / macOS (TTL 64)</td>
      <td>Default TTL typically set to 64.</td>
    </tr>
    <tr>
      <td>Solaris (TTL 255)</td>
      <td>Default TTL typically set to 255.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Voice over IP (VoIP) &amp; Session Initiation Protocol (SIP)</strong></h4>
<p class="lead mb-4">VoIP delivers voice and video communications using signaling protocols like SIP (TCP/5060, 5061) or H.323 (TCP/1720):</p>

<table class="default-table">
  <thead>
    <tr>
      <th>SIP Method</th>
      <th>Operation Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>INVITE / ACK</strong></td>
      <td>Initiates a multimedia session / Confirms receipt of the INVITE request.</td>
    </tr>
    <tr>
      <td><strong>BYE / CANCEL</strong></td>
      <td>Terminates an active session / Cancels a pending INVITE request.</td>
    </tr>
    <tr>
      <td><strong>REGISTER</strong></td>
      <td>Registers a User Agent (UA) with a SIP server.</td>
    </tr>
    <tr>
      <td><strong>OPTIONS</strong></td>
      <td>Requests capability information (codecs, media); can be leveraged to enumerate users.</td>
    </tr>
  </tbody>
</table>

<br />

### 2.11 Wireless Networks {#ch2.11-wireless-networks}

<h4 class="mb-2"><strong>&gt; Wireless Networks Overview</strong></h4>
<p class="lead mb-4">Wireless networks utilize radio frequency (RF) signals (primarily across 2.4 GHz and 5 GHz bands) to enable mobile node communications without physical cabling:</p>
<ul>
  <li><strong>Coverage Scales:</strong> Ranges from localized Wireless Local Area Networks (WLANs / Wi-Fi) spanning hundreds of feet to Wireless Wide Area Networks (WWANs) using cellular data (3G/4G LTE/5G).</li>
  <li><strong>Centralized Access Control:</strong> Devices request permission via a central Wireless Access Point (WAP) using the IEEE 802.11 standard. The WAP bridges wireless clients to the underlying wired infrastructure.</li>
  <li><strong>Environmental Factors:</strong> Signal reach and throughput are affected by transmitter power, physical obstacles, and environmental RF noise density. Modern networks rely on spread-spectrum transmission and error correction.</li>
</ul>

<h4 class="mb-2"><strong>&gt; Wi-Fi Connection &amp; Association Request Fields</strong></h4>
<p class="lead mb-4">To join a Wi-Fi network, a client transmits an IEEE 802.11 Association Request frame containing device capabilities and parameters:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Association Request Field</th>
      <th>Functional Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>MAC Address</strong></td>
      <td>Unique hardware identifier belonging to the client's wireless adapter.</td>
    </tr>
    <tr>
      <td><strong>SSID</strong></td>
      <td>Service Set Identifier (network name). Note: Hiding SSID broadcasting does not eliminate visibility, as the SSID remains exposed in authentication packets.</td>
    </tr>
    <tr>
      <td><strong>Supported Data Rates</strong></td>
      <td>List of data transmission speeds supported by the client hardware.</td>
    </tr>
    <tr>
      <td><strong>Supported Channels</strong></td>
      <td>List of operating RF frequencies/channels supported by the client.</td>
    </tr>
    <tr>
      <td><strong>Supported Security Protocols</strong></td>
      <td>Supported security and encryption standards (e.g., WPA2, WPA3).</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Legacy WEP Architecture &amp; Vulnerabilities</strong></h4>
<p class="lead mb-4">Wired Equivalent Privacy (WEP) is an obsolete, insecure wireless protocol utilizing the RC4 stream cipher alongside a Cyclic Redundancy Check (CRC):</p>

<table class="default-table">
  <thead>
    <tr>
      <th>WEP Standard</th>
      <th>Initialization Vector (IV)</th>
      <th>Secret Key Length</th>
      <th>Total Key Length</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>WEP-40 / WEP-64</strong></td>
      <td>24 bits</td>
      <td>40 bits</td>
      <td>64 bits</td>
    </tr>
    <tr>
      <td><strong>WEP-104</strong></td>
      <td>24 bits</td>
      <td>80 bits</td>
      <td>104 bits</td>
    </tr>
  </tbody>
</table>

<table class="default-table">
  <thead>
    <tr>
      <th>Step</th>
      <th>Actor</th>
      <th>Handshake Action &amp; Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1</strong></td>
      <td>Client</td>
      <td>Sends an association request packet to the WAP.</td>
    </tr>
    <tr>
      <td><strong>2</strong></td>
      <td>WAP</td>
      <td>Responds with an association response containing a cleartext challenge string.</td>
    </tr>
    <tr>
      <td><strong>3</strong></td>
      <td>Client</td>
      <td>Encrypts the challenge string using the shared secret key and sends the result back.</td>
    </tr>
    <tr>
      <td><strong>4</strong></td>
      <td>WAP</td>
      <td>Decrypts/calculates the response with the shared key and returns an authentication status response.</td>
    </tr>
  </tbody>
</table>

<ul>
  <li><strong>Small IV Space Vulnerability:</strong> The 24-bit IV size leads to frequent IV reuse across high-traffic networks, allowing attackers to collect overlapping packets and recover the secret key.</li>
  <li><strong>CRC Data Integrity Flaw:</strong> WEP calculates the CRC ICV (Integrity Check Value) on unencrypted plaintext rather than ciphertext, allowing single-packet decryption and bit-flipping manipulation without requiring key knowledge.</li>
</ul>

<h4 class="mb-2"><strong>&gt; Enterprise Authentication &amp; Hardening Strategies</strong></h4>
<p class="lead mb-4">Modern wireless deployments implement robust authentication frameworks, centralized access control, and defensive hardening controls:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Protocol / Feature</th>
      <th>Operational &amp; Security Characteristics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>WPA2 / WPA3</strong></td>
      <td>Replaces RC4/WEP with strong AES encryption. Features <strong>WPA-Personal</strong> (Pre-Shared Key / PSK) and <strong>WPA-Enterprise</strong> (centralized RADIUS/TACACS+ verification).</td>
    </tr>
    <tr>
      <td><strong>LEAP vs. PEAP</strong></td>
      <td><strong>LEAP</strong> uses weak, non-tunneled MS-CHAPv2 auth with a shared key; <strong>PEAP</strong> establishes an encrypted TLS tunnel via digital certificates to safeguard authentication data.</td>
    </tr>
    <tr>
      <td><strong>TACACS+ Encryption</strong></td>
      <td>Encrypts the entire payload (including authentication credentials) between the WAP and AAA server using protocols like SSL/TLS or IPsec.</td>
    </tr>
    <tr>
      <td><strong>EAP-TLS</strong></td>
      <td>Deploys PKI and mutual digital certificates for both server and client authentication, delivering optimal enterprise security.</td>
    </tr>
    <tr>
      <td><strong>MAC Filtering</strong></td>
      <td>Restricts WAP access based on explicit hardware MAC address allowlists (can be bypassed via MAC spoofing).</td>
    </tr>
    <tr>
      <td><strong>Disassociation Attacks</strong></td>
      <td>Wireless denial-of-service attack where spoofed disassociation frames disconnect legitimate clients, often forcing re-authentication to capture 4-way handshakes or perform MITM attacks.</td>
    </tr>
  </tbody>
</table>

<br />

### 2.12 Virtual Private Networks {#ch2.12-virtual-private-networks}

<h4 class="mb-2"><strong>&gt; Virtual Private Networks (VPN) Overview</strong></h4>
<p class="lead mb-4">A Virtual Private Network (VPN) creates an encrypted connection over a public network, granting remote devices secure access to internal resources as if physically connected to the private local network:</p>
<ul>
  <li><strong>Core Benefits:</strong> Ensures confidentiality and integrity via encryption, allows remote workforce connectivity, and provides cost-effective site-to-site interconnections.</li>
  <li><strong>Internal Addressing:</strong> Upon successful authentication, the remote device is assigned a local internal IP address, allowing direct access to restricted enterprise servers.</li>
</ul>

<h4 class="mb-2"><strong>&gt; VPN Functional Requirements &amp; Architecture</strong></h4>
<p class="lead mb-4">Key building blocks necessary to establish and maintain a secure VPN tunnel:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Component</th>
      <th>Role &amp; Operational Function</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>VPN Client</strong></td>
      <td>Software installed on the host device (e.g., OpenVPN client) that initiates and maintains the tunnel.</td>
    </tr>
    <tr>
      <td><strong>VPN Server</strong></td>
      <td>Network gateway responsible for authenticating client requests and routing traffic into the private network.</td>
    </tr>
    <tr>
      <td><strong>Encryption</strong></td>
      <td>Algorithmic data protection (e.g., AES, IPsec) safeguarding transmitted payloads against eavesdropping.</td>
    </tr>
    <tr>
      <td><strong>Authentication</strong></td>
      <td>Verification mechanism utilizing shared secrets, digital certificates, or multi-factor credentials before access is granted.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; IPsec Protocol Suite &amp; Modes</strong></h4>
<p class="lead mb-4">Internet Protocol Security (IPsec) provides network-layer security using two distinct sub-protocols and operational modes:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>IPsec Protocol</th>
      <th>Protocol # / Port</th>
      <th>Security Services Offered</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Authentication Header (AH)</strong></td>
      <td>IP Protocol 51</td>
      <td>Provides integrity and source authentication; <strong>no encryption</strong>.</td>
    </tr>
    <tr>
      <td><strong>Encapsulating Security Payload (ESP)</strong></td>
      <td>IP Protocol 50<br>(UDP/4500 with NAT-T)</td>
      <td>Provides full payload encryption and optional authentication.</td>
    </tr>
    <tr>
      <td><strong>Internet Key Exchange (IKE)</strong></td>
      <td>UDP/500</td>
      <td>Establishes Security Associations (SA) using Diffie-Hellman key exchange.</td>
    </tr>
  </tbody>
</table>

<table class="default-table">
  <thead>
    <tr>
      <th>Operating Mode</th>
      <th>Encapsulation Scope</th>
      <th>Primary Use Case</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Transport Mode</strong></td>
      <td>Encrypts/authenticates only the IP payload; original IP header remains unencrypted.</td>
      <td>End-to-end host communication.</td>
    </tr>
    <tr>
      <td><strong>Tunnel Mode</strong></td>
      <td>Encrypts/authenticates the entire original IP packet (payload + original header) inside a new IP header.</td>
      <td>Site-to-Site and Remote Access VPN tunnels.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Legacy PPTP &amp; Port Reference</strong></h4>
<p class="lead mb-4">Summary of common VPN tunneling protocols, default transport ports, and security posture:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Protocol</th>
      <th>Port / Protocol No.</th>
      <th>Security Posture &amp; Characteristics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>IKEv1 / IKEv2</strong></td>
      <td>UDP/500</td>
      <td>Modern standard for key exchange in IPsec VPN solutions.</td>
    </tr>
    <tr>
      <td><strong>IPsec NAT-Traversal</strong></td>
      <td>UDP/4500</td>
      <td>Encapsulates ESP packets inside UDP headers to navigate NAT devices.</td>
    </tr>
    <tr>
      <td><strong>Point-to-Point Tunneling Protocol (PPTP)</strong></td>
      <td>TCP/1723<br>(IP Protocol 47 GRE)</td>
      <td><strong>Obsolete / Insecure.</strong> Uses MS-CHAPv2 authentication and weak DES encryption, which can be easily cracked. Replaced by OpenVPN, WireGuard, or IPsec/IKEv2.</td>
    </tr>
  </tbody>
</table>

<br />

### 2.13 Vendor Specific Information {#ch2.13-vendor-specific-information}

<h4 class="mb-2"><strong>&gt; Cisco IOS &amp; Password Architecture</strong></h4>
<p class="lead mb-4">Cisco IOS is the multi-feature operating system powering Cisco routers and switches via CLI or GUI management interfaces:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Password Type</th>
      <th>Operational Scope &amp; Security Characteristics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>User Password</strong></td>
      <td>Restricts initial login access to the device shell/CLI session.</td>
    </tr>
    <tr>
      <td><strong>Enable Password</strong></td>
      <td>Grants access to privileged EXEC mode ("enable" mode); stored in cleartext or weak Type 7 encryption.</td>
    </tr>
    <tr>
      <td><strong>Secret</strong></td>
      <td>Secures access to specific remote management services and administrative functions.</td>
    </tr>
    <tr>
      <td><strong>Enable Secret</strong></td>
      <td>High-security password overriding the standard enable password; uses strong cryptographic hashing (Type 5 MD5 / Type 8/9 PBKDF2/scrypt).</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; VLAN Fundamentals &amp; Trunking Protocols</strong></h4>
<p class="lead mb-4">Virtual Local Area Networks (VLANs) logically segment switch ports into distinct broadcast domains (VLAN IDs 1–4094):</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>VLAN Ranges / Protocol</th>
      <th>Technical Characteristics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2"><strong>VLAN Ranges</strong></td>
      <td><strong>Normal Range (1–1005)</strong></td>
      <td>Stored in <code>vlan.dat</code>. VLAN 1 is the immutable default; 1002–1005 are legacy FDDI/Token Ring.</td>
    </tr>
    <tr>
      <td><strong>Extended Range (1006–4094)</strong></td>
      <td>Used for large-scale enterprise/service provider routing; configurations are stored in running-config.</td>
    </tr>
    <tr>
      <td rowspan="2"><strong>Membership Types</strong></td>
      <td><strong>Static VLANs</strong></td>
      <td>Ports assigned manually by admins; highly secure against network spoofing.</td>
    </tr>
    <tr>
      <td><strong>Dynamic VLANs</strong></td>
      <td>Assigned via VMPS based on MAC addresses; flexible, but vulnerable to MAC spoofing attacks.</td>
    </tr>
    <tr>
      <td rowspan="2"><strong>Trunking Methods</strong></td>
      <td><strong>ISL (Legacy)</strong></td>
      <td>Cisco-proprietary protocol encapsulating the entire frame with a 26-byte header and 4-byte trailer. Deprecated.</td>
    </tr>
    <tr>
      <td><strong>IEEE 802.1Q</strong></td>
      <td>Industry-standard method inserting a 4-byte tag into the Ethernet header (TPID <code>0x8100</code> + 12-bit VID field).</td>
    </tr>
    <tr>
      <td><strong>Scalability Overlay</strong></td>
      <td><strong>VXLAN (RFC 7348)</strong></td>
      <td>Layer 2 overlay over Layer 3 networks. Uses a 24-bit Network Identifier (VNI) supporting up to 16 million segments.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Linux &amp; Windows VLAN Interface Configuration</strong></h4>
<p class="lead mb-4">Commands to configure 802.1Q tagged sub-interfaces on host NICs:</p>

<ul>
  <li><strong>Linux (iproute2):</strong>
    <ul>
      <li>Load module: <code>sudo modprobe 8021q</code></li>
      <li>Create VLAN interface: <code>sudo ip link add link eth0 name eth0.20 type vlan id 20</code></li>
      <li>Assign IP &amp; bring UP: <code>sudo ip addr add 192.168.1.1/24 dev eth0.20 &amp;&amp; sudo ip link set up eth0.20</code></li>
    </ul>
  </li>
  <li><strong>Windows (PowerShell):</strong>
    <ul>
      <li>Inspect adapter properties: <code>Get-NetAdapterAdvancedProperty -DisplayName "vlan id"</code></li>
      <li>Set VLAN ID: <code>Set-NetAdapter -Name "Ethernet 2" -VlanID 10</code></li>
    </ul>
  </li>
  <li><strong>Packet Inspection (tshark):</strong>
    <ul>
      <li>Enumerate active VLAN IDs from PCAP: <code>tshark -r capture.pcapng -T fields -e vlan.id | sort -n -u</code></li>
    </ul>
  </li>
</ul>

<h4 class="mb-2"><strong>&gt; VLAN Exploitation Vectors &amp; Infrastructure Protocols</strong></h4>
<p class="lead mb-4">Common Layer 2 attack methodologies and neighbor discovery protocols:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Attack / Protocol</th>
      <th>Mechanism &amp; Security Impact</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Switch-Spoofing VLAN Hopping</strong></td>
      <td>Exploits unhardened Dynamic Trunking Protocol (DTP) ports to negotiate a trunk link, exposing all VLAN traffic to an attacker.</td>
    </tr>
    <tr>
      <td><strong>Double-Tagging VLAN Hopping</strong></td>
      <td>Attacker crafts a double-tagged frame (outer tag = Native VLAN, inner tag = Target VLAN). The first switch strips the native tag without touching the inner tag, routing it to the victim VLAN.</td>
    </tr>
    <tr>
      <td><strong>Cisco Discovery Protocol (CDP)</strong></td>
      <td>Layer 2 neighbor discovery protocol transmitting device names, IP addresses, native VLANs, hardware models, and IOS versions in cleartext.</td>
    </tr>
    <tr>
      <td><strong>Spanning Tree Protocol (STP)</strong></td>
      <td>Layer 2 loop prevention protocol that negotiates topology roles (Root Bridge, port states) using Bridge Protocol Data Units (BPDUs).</td>
    </tr>
  </tbody>
</table>

<br />

### 2.14 Key Exchange Mechanisms {#ch2.14-key-exchange-mechanisms}

<h4 class="mb-2"><strong>&gt; Key Exchange Mechanisms</strong></h4>
<p class="lead mb-4">Key exchange mechanisms allow two entities to establish a shared cryptographic secret over an untrusted, public communication channel:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Algorithm</th>
      <th>Type / Category</th>
      <th>Primary Function &amp; Security Attributes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Diffie-Hellman (DH)</strong></td>
      <td>Asymmetric Key Exchange</td>
      <td>Finite-field mathematical key agreement. Susceptible to Man-in-the-Middle (MITM) attacks if unauthenticated; higher computational overhead at equivalent security levels compared to ECC.</td>
    </tr>
    <tr>
      <td><strong>RSA</strong></td>
      <td>Asymmetric Encryption &amp; Signature</td>
      <td>Relies on prime factorization hardness. Supports encryption, digital signatures, PKINIT (Kerberos), and TLS handshake authentication; requires larger key sizes (2048+ bits) for equivalent security.</td>
    </tr>
    <tr>
      <td><strong>ECDH</strong></td>
      <td>Elliptic Curve Key Exchange</td>
      <td>Leverages Elliptic Curve Cryptography (ECC) for key agreement. Offers smaller key sizes, lower computational complexity, high performance, and supports Perfect Forward Secrecy (PFS).</td>
    </tr>
    <tr>
      <td><strong>ECDSA</strong></td>
      <td>Elliptic Curve Digital Signature</td>
      <td>Provides high-efficiency digital signatures for message integrity, non-repudiation, and host/peer authentication during key exchange processes.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Cryptographic Algorithm Comparison</strong></h4>
<p class="lead mb-4">Comparative evaluation of key exchange and signature algorithms regarding performance and security profile:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Algorithm</th>
      <th>Acronym</th>
      <th>Security &amp; Operational Characteristics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Diffie-Hellman</strong></td>
      <td>DH</td>
      <td>Secure with strong parameters and explicit authentication; slower computation than ECDH at equal bit strength.</td>
    </tr>
    <tr>
      <td><strong>Rivest–Shamir–Adleman</strong></td>
      <td>RSA</td>
      <td>Industry standard for legacy signature/key transport; computationally heavy compared to ECC solutions.</td>
    </tr>
    <tr>
      <td><strong>Elliptic Curve Diffie-Hellman</strong></td>
      <td>ECDH</td>
      <td>Delivers enhanced cryptographic strength per bit and significantly reduced latency compared to standard DH.</td>
    </tr>
    <tr>
      <td><strong>Elliptic Curve Digital Signature Algorithm</strong></td>
      <td>ECDSA</td>
      <td>Provides high-efficiency digital signature verification and authentication with minimal payload overhead.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Internet Key Exchange (IKE) &amp; Operational Modes</strong></h4>
<p class="lead mb-4">Internet Key Exchange (IKE) negotiates Security Associations (SAs) and keys for IPsec VPN tunnels, relying on DH/ECDH and symmetric encryption (e.g., AES):</p>

<table class="default-table">
  <thead>
    <tr>
      <th>IKE Mode</th>
      <th>Exchange Sequence</th>
      <th>Identity Protection &amp; Security Profile</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Main Mode</strong></td>
      <td>3 Phase Exchange<br>(6 Messages)</td>
      <td><strong>Encrypted Identity Protection.</strong> Negotiates crypto parameters, performs DH key exchange, and authenticates peer identities securely. Slower due to extra round trips.</td>
    </tr>
    <tr>
      <td><strong>Aggressive Mode</strong></td>
      <td>2 Phase Exchange<br>(3 Messages)</td>
      <td><strong>No Identity Protection.</strong> Transmits peer identities in cleartext during the first exchange phase. Faster execution, but vulnerable to offline PSK dictionary/brute-force attacks.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Pre-Shared Key (PSK) Authentication</strong></h4>
<p class="lead mb-4">Operational requirements and risk factors when utilizing Pre-Shared Keys within IKE sessions:</p>

<ul>
  <li><strong>Authentication Basis:</strong> Both peers share a pre-configured secret out-of-band to establish mutual trust and authenticate subsequent payload encryption.</li>
  <li><strong>Security Constraints:</strong> Fragile against weak passphrase selection, especially when paired with IKE Aggressive Mode where hashes containing the PSK can be captured and cracked offline.</li>
  <li><strong>Mitigation Strategy:</strong> Deploy strong, high-entropy PSKs or transition to Public Key Infrastructure (PKI) digital certificates (RSA/ECDSA) for mutual authentication.</li>
</ul>

<br />

### 2.15 Authentication Protocols {#ch2.15-authentication-protocols}

<h4 class="mb-2"><strong>&gt; Authentication Protocols Overview</strong></h4>
<p class="lead mb-4">Authentication protocols define standardized frameworks for verifying identities, exchanging credentials, and establishing trust between network entities:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>Protocol / Technology</th>
      <th>Operational Function &amp; Architecture</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="4"><strong>Enterprise &amp; Domain Auth</strong></td>
      <td><strong>Kerberos</strong></td>
      <td>Key Distribution Center (KDC) ticket-based authentication widely used in Active Directory environments.</td>
    </tr>
    <tr>
      <td><strong>SRP</strong></td>
      <td>Secure Remote Password protocol; password-authenticated key exchange resilient to MITM and passive eavesdropping.</td>
    </tr>
    <tr>
      <td><strong>PKI</strong></td>
      <td>Public Key Infrastructure framework utilizing asymmetric keys, digital certificates, and Certificate Authorities (CAs).</td>
    </tr>
    <tr>
      <td><strong>RADIUS / TACACS+</strong></td>
      <td>AAA (Authentication, Authorization, Accounting) protocols managing centralized access control for network hardware.</td>
    </tr>
    <tr>
      <td rowspan="3"><strong>Identity &amp; Federation</strong></td>
      <td><strong>SAML</strong></td>
      <td>XML-based open standard for exchanging authentication and authorization assertions across federated domains.</td>
    </tr>
    <tr>
      <td><strong>OAuth 2.0</strong></td>
      <td>Authorization framework granting third-party apps scoped token access to resources without sharing credentials.</td>
    </tr>
    <tr>
      <td><strong>OpenID Connect (OIDC)</strong></td>
      <td>Decentralized identity layer built on top of OAuth 2.0 enabling Single Sign-On (SSO) web authentication.</td>
    </tr>
    <tr>
      <td rowspan="3"><strong>Multi-Factor &amp; Modern Standards</strong></td>
      <td><strong>MFA / 2FA</strong></td>
      <td>Combines multiple distinct factors: knowledge (password), possession (hardware token/phone), or inherence (biometrics).</td>
    </tr>
    <tr>
      <td><strong>FIDO / FIDO2</strong></td>
      <td>Open standards for passwordless, unphishable public-key authentication (WebAuthn / CTAP).</td>
    </tr>
    <tr>
      <td><strong>SSO</strong></td>
      <td>Authentication service permitting users to access multiple applications using a single set of enterprise credentials.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Transport &amp; Legacy Network Access Protocols</strong></h4>
<p class="lead mb-4">Protocols governing point-to-point connections, remote access management, and secure web communications:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Protocol</th>
      <th>Transport / Security Layer</th>
      <th>Operational Mechanics &amp; Security Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>PAP</strong></td>
      <td>Cleartext PPP</td>
      <td><strong>Insecure.</strong> Transmits unencrypted passwords directly over the wire without challenge mechanisms.</td>
    </tr>
    <tr>
      <td><strong>CHAP</strong></td>
      <td>3-Way Handshake</td>
      <td>Uses a challenge-response mechanism with MD5 hashing to verify peer identity without sending cleartext credentials.</td>
    </tr>
    <tr>
      <td><strong>SSH</strong></td>
      <td>Encrypted Shell (TCP/22)</td>
      <td>Secures remote command-line access, file transfers (SFTP/SCP), and port forwarding via asymmetric/symmetric cryptography.</td>
    </tr>
    <tr>
      <td><strong>HTTPS (SSL / TLS)</strong></td>
      <td>Encrypted Web (TCP/443)</td>
      <td>Wraps HTTP inside a TLS tunnel, using PKI digital certificates to authenticate servers and encrypt web traffic.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Extensible Authentication Frameworks (EAP, LEAP, PEAP)</strong></h4>
<p class="lead mb-4">Extensible Authentication Protocol (EAP) is an authentication framework heavily deployed in enterprise 802.1X wireless and VPN environments:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>EAP Variant</th>
      <th>Encryption &amp; Outer Tunnel</th>
      <th>Inner Authentication &amp; Vulnerabilities</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>LEAP (Cisco)</strong></td>
      <td>Legacy RC4 Encryption (No TLS Tunnel)</td>
      <td><strong>Vulnerable.</strong> Uses non-tunneled MS-CHAPv2 exchange. Exposed to offline dictionary attacks and credential theft. Deprecated.</td>
    </tr>
    <tr>
      <td><strong>PEAP</strong></td>
      <td>Server-side TLS Tunnel</td>
      <td>Encapsulates inner authentication (e.g., PEAP-MSCHAPv2) inside an encrypted TLS tunnel using a server digital certificate. Secure, but vulnerable to rogue AP / certificate validation bypass attacks.</td>
    </tr>
    <tr>
      <td><strong>EAP-TLS</strong></td>
      <td>Mutual TLS Tunnel</td>
      <td><strong>Highest Security.</strong> Requires digital certificates on both the server and client host, delivering strong mutual authentication.</td>
    </tr>
  </tbody>
</table>

<br />

### 2.16 TCP/UDP Connections {#ch2.16-tcp-udp-connections}

<h4 class="mb-2"><strong>&gt; Transport Layer Protocols: TCP vs. UDP</strong></h4>
<p class="lead mb-4">The Transport Layer (Layer 4) relies on two primary protocols to transmit data across networks, each optimized for different delivery requirements:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Protocol Feature</th>
      <th>Transmission Control Protocol (TCP)</th>
      <th>User Datagram Protocol (UDP)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Connection State</strong></td>
      <td>Connection-oriented (Requires 3-way handshake).</td>
      <td>Connectionless (No pre-established session).</td>
    </tr>
    <tr>
      <td><strong>Reliability</strong></td>
      <td>High; guarantees delivery via ACKs and retransmissions.</td>
      <td>Best-effort; no delivery guarantees or ACKs.</td>
    </tr>
    <tr>
      <td><strong>Data Unit</strong></td>
      <td>Segment</td>
      <td>Datagram</td>
    </tr>
    <tr>
      <td><strong>Header Overhead</strong></td>
      <td>20–60 bytes (includes Seq/Ack numbers, flags, window size).</td>
      <td>8 bytes (Source/Dest Port, Length, Checksum).</td>
    </tr>
    <tr>
      <td><strong>Primary Use Cases</strong></td>
      <td>Web traffic (HTTP/HTTPS), Email (SMTP), File Transfer (FTP).</td>
      <td>Real-time streaming, Voice over IP (VoIP), Online Gaming, DNS.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; IP Header Structure &amp; Dual-Homed Host Identification</strong></h4>
<p class="lead mb-4">Internet Protocol (IP) packets encapsulate payload data and include crucial routing and fragmentation control fields in the header:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>IP Header Field</th>
      <th>Bit Size</th>
      <th>Functional Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Version</strong></td>
      <td>4 bits</td>
      <td>Identifies IP protocol version (e.g., IPv4 or IPv6).</td>
    </tr>
    <tr>
      <td><strong>Header Length (IHL)</strong></td>
      <td>4 bits</td>
      <td>Specifies the total length of the IP header in 32-bit words.</td>
    </tr>
    <tr>
      <td><strong>Total Length</strong></td>
      <td>16 bits</td>
      <td>Entire packet size in bytes (header + payload).</td>
    </tr>
    <tr>
      <td><strong>Identification (IP ID)</strong></td>
      <td>16 bits</td>
      <td>Unique sequence counter used to assemble fragmented packets (0–65535).</td>
    </tr>
    <tr>
      <td><strong>Flags &amp; Fragment Offset</strong></td>
      <td>3 bits / 13 bits</td>
      <td>Controls fragmentation rules (DF/MF) and tracks fragment position.</td>
    </tr>
    <tr>
      <td><strong>Time to Live (TTL)</strong></td>
      <td>8 bits</td>
      <td>Prevents infinite routing loops by decrementing at each hop until 0.</td>
    </tr>
    <tr>
      <td><strong>Protocol</strong></td>
      <td>8 bits</td>
      <td>Identifies encapsulated L4 protocol (e.g., 6 = TCP, 17 = UDP).</td>
    </tr>
    <tr>
      <td><strong>Source / Destination IP</strong></td>
      <td>32 bits each</td>
      <td>Logical origin and target network addresses.</td>
    </tr>
  </tbody>
</table>

<ul>
  <li><strong>Dual-Homed Host Detection via IP ID:</strong> Because a single host increments its IP ID sequentially across outgoing packets regardless of the source interface, consecutive or nearly identical IP ID values from different source IP addresses strongly indicate that the interfaces belong to the same physical machine.</li>
</ul>

<h4 class="mb-2"><strong>&gt; Route Tracing Methods &amp; IP Record-Route Option</strong></h4>
<p class="lead mb-4">Methods for mapping network hops and identifying intermediate layer-3 devices:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Mechanism</th>
      <th>Operational Mechanics</th>
      <th>Response Characteristics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Record-Route Option (IP RR)</strong></td>
      <td>Inserts an optional field into the IP header during <code>ping -R</code> to log up to 9 hop interfaces dynamically.</td>
      <td>Returns ICMP Echo Reply containing the exact array of traversed router interface IPs.</td>
    </tr>
    <tr>
      <td><strong>TCP Traceroute</strong></td>
      <td>Sends TCP SYN packets starting with TTL=1, incrementing TTL by 1 per hop.</td>
      <td>Intermediate routers respond with <code>ICMP Time Exceeded</code>; target host responds with <code>TCP SYN/ACK</code> or <code>RST</code>.</td>
    </tr>
    <tr>
      <td><strong>UDP Traceroute (Unix Default)</strong></td>
      <td>Sends UDP datagrams to high-numbered ports with incremental TTL values.</td>
      <td>Routers return <code>ICMP Time Exceeded</code>; target host returns <code>ICMP Destination/Port Unreachable</code> upon arrival.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Blind Spoofing &amp; TCP Initial Sequence Numbers (ISN)</strong></h4>
<p class="lead mb-4">Blind spoofing is a network attack where an adversary sends malicious traffic with a forged source IP without seeing the target's replies:</p>

<ul>
  <li><strong>Attack Mechanism:</strong> The attacker transmits a TCP SYN packet using a spoofed source IP. The target host replies with a <code>SYN/ACK</code> sent to the legitimate owner of that IP (which the attacker cannot see).</li>
  <li><strong>Exploiting Predictable ISNs:</strong> If the target's Initial Sequence Number (ISN) generator is predictable, the attacker can guess the ACK response, send a forged final ACK, and successfully establish a unidirectional TCP session or execute unauthorized commands.</li>
  <li><strong>Primary Impact:</strong> Bypasses IP-based trust relationships, hijacks active connections, or disrupts session integrity across remote networks.</li>
</ul>

<br />

### 2.17 Cryptography {#ch2.17-cryptography}

<h4 class="mb-2"><strong>&gt; Symmetric vs. Asymmetric Encryption</strong></h4>
<p class="lead mb-4">Cryptography uses mathematical algorithms to secure data confidentiality, integrity, and authenticity through symmetric and asymmetric key paradigms:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Symmetric Encryption</th>
      <th>Asymmetric Encryption</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Keys Used</strong></td>
      <td>Single shared secret key for both encryption and decryption.</td>
      <td>KeyPair: Public key (encryption/verification) + Private key (decryption/signing).</td>
    </tr>
    <tr>
      <td><strong>Key Exchange</strong></td>
      <td>Requires secure out-of-band channel; vulnerable if key is intercepted.</td>
      <td>Public key shared freely; private key stays strictly confidential.</td>
    </tr>
    <tr>
      <td><strong>Performance &amp; Speed</strong></td>
      <td>Extremely fast; highly efficient for bulk data processing.</td>
      <td>Computationally heavy; slower due to complex mathematical operations.</td>
    </tr>
    <tr>
      <td><strong>Primary Use Cases</strong></td>
      <td>Disk encryption (BitLocker), bulk network payloads, databases.</td>
      <td>Digital signatures, key exchange, TLS/SSL handshakes, SSH, PKI.</td>
    </tr>
    <tr>
      <td><strong>Key Algorithms</strong></td>
      <td>AES, DES, 3DES, RC4.</td>
      <td>RSA, ECC (ECDH/ECDSA), PGP/GPG.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Symmetric Block Ciphers: DES, 3DES, and AES</strong></h4>
<p class="lead mb-4">Evolution of standardized block ciphers from legacy bit permutations to modern rijndael structures:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Cipher Algorithm</th>
      <th>Block Size</th>
      <th>Key Lengths</th>
      <th>Security Profile &amp; Application Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>DES</strong></td>
      <td>64 bits</td>
      <td>56 bits (64 bits total, 8 parity)</td>
      <td><strong>Insecure.</strong> Small key space vulnerable to brute-force attacks within hours. Legacy status only.</td>
    </tr>
    <tr>
      <td><strong>3DES (Triple DES)</strong></td>
      <td>64 bits</td>
      <td>112 or 168 bits (2 or 3 keys)</td>
      <td><strong>Deprecated.</strong> Applies 3 encryption rounds (Encrypt-Decrypt-Encrypt). Slow and vulnerable to Sweet32 block-collision attacks.</td>
    </tr>
    <tr>
      <td><strong>AES</strong></td>
      <td>128 bits</td>
      <td>128, 192, or 256 bits</td>
      <td><strong>Industry Standard.</strong> High performance, resistant to known cryptanalytic attacks. Widely deployed across Wi-Fi (WPA2/3), IPsec, SSH, and OpenSSL.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Block Cipher Modes of Operation</strong></h4>
<p class="lead mb-4">Cipher modes determine how block ciphers repeatedly process data blocks larger than the fixed block size:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Cipher Mode</th>
      <th>Operation Type</th>
      <th>Security Profile &amp; Ideal Use Cases</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Electronic Code Book (ECB)</strong></td>
      <td>Block-by-Block</td>
      <td><strong>Insecure.</strong> Encrypts identical plaintext blocks into identical ciphertext blocks, revealing data patterns. Not recommended.</td>
    </tr>
    <tr>
      <td><strong>Cipher Block Chaining (CBC)</strong></td>
      <td>Block Chaining (IV)</td>
      <td>XORs each plaintext block with the preceding ciphertext block. Used in disk encryption (VeraCrypt) and legacy SSL/TLS. Requires padding.</td>
    </tr>
    <tr>
      <td><strong>Cipher Feedback (CFB)</strong></td>
      <td>Stream Cipher Mode</td>
      <td>Converts block cipher into a self-synchronizing stream cipher. Well-suited for real-time network streams, PKCS, and BitLocker.</td>
    </tr>
    <tr>
      <td><strong>Output Feedback (OFB)</strong></td>
      <td>Stream Cipher Mode</td>
      <td>Generates a key stream independent of plaintext/ciphertext. Used for real-time communication streaming, PKCS, and SSH.</td>
    </tr>
    <tr>
      <td><strong>Counter (CTR)</strong></td>
      <td>Stream Cipher Mode</td>
      <td>Encrypts a counter sequence to produce a key stream. Highly parallelizable; used in high-speed IPsec, disk encryption, and BitLocker.</td>
    </tr>
    <tr>
      <td><strong>Galois/Counter Mode (GCM)</strong></td>
      <td>Authenticated Encryption (AEAD)</td>
      <td>Combines CTR mode with Galois field authentication. Provides simultaneous confidentiality and integrity verification. Standard for modern TLS, VPNs, and wireless security.</td>
    </tr>
  </tbody>
</table>

<br />


## 3. Linux Fundamentals {#ch3}

<br />

### 3.1 Linux Structure {#ch3.1-linux-structure}

<h4 class="mb-2"><strong>&gt; The Linux Philosophy</strong></h4>
<p class="lead mb-4">The core architectural principles behind Linux design, emphasizing simplicity, modularity, and explicit text configuration:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Principle</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Everything is a file</strong></td>
      <td>All system resources, including hardware devices, processes, and network connections, are represented as files that can be read from and written to using standard tools.</td>
    </tr>
    <tr>
      <td><strong>Small, single-purpose programs</strong></td>
      <td>The OS relies on modular, dedicated tools designed to perform one specific function exceptionally well.</td>
    </tr>
    <tr>
      <td><strong>Ability to chain programs together</strong></td>
      <td>Tools can be integrated via pipes and redirection to perform complex data processing and filtering tasks.</td>
    </tr>
    <tr>
      <td><strong>Avoid captive user interfaces</strong></td>
      <td>Designed primarily around the shell (terminal) to grant administrators direct control over operating system operations.</td>
    </tr>
    <tr>
      <td><strong>Configuration data stored in text files</strong></td>
      <td>System configuration is maintained in plain text files (e.g., <code>/etc/passwd</code>), making settings readable, easily editable, and scriptable.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Core OS Components</strong></h4>
<p class="lead mb-4">Functional subsystems that compose a complete, operational Linux system:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Component</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Bootloader</strong></td>
      <td>Low-level code executed at startup to initialize memory and load the Linux kernel (e.g., GRUB).</td>
    </tr>
    <tr>
      <td><strong>OS Kernel</strong></td>
      <td>The central core of the operating system managing system CPU, memory, process allocation, and hardware I/O devices.</td>
    </tr>
    <tr>
      <td><strong>Daemons</strong></td>
      <td>Background services that load after boot or login to manage essential system functions like task scheduling, logging, and networking.</td>
    </tr>
    <tr>
      <td><strong>OS Shell</strong></td>
      <td>The command interpreter acting as the primary interface between the user and the kernel (e.g., Bash, Zsh, Fish).</td>
    </tr>
    <tr>
      <td><strong>Graphics Server</strong></td>
      <td>The underlying graphical subsystem (e.g., X11 or Wayland) that enables GUI applications to render locally or remotely.</td>
    </tr>
    <tr>
      <td><strong>Window Manager / Desktop Environment</strong></td>
      <td>The user-facing GUI (e.g., GNOME, KDE, MATE) providing window controls, desktop panels, and integrated graphical utility suites.</td>
    </tr>
    <tr>
      <td><strong>Utilities</strong></td>
      <td>System tools and application programs designed to perform administrative tasks or user routines.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Abstraction Layers</strong></h4>
<p class="lead mb-4">Structural layers partitioning user interactions from physical hardware:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Layer</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Hardware</strong></td>
      <td>Physical hardware resources including CPU, RAM, storage drives, and system peripherals.</td>
    </tr>
    <tr>
      <td><strong>Kernel</strong></td>
      <td>Virtualizes hardware resources, providing isolated memory space and execution contexts for individual processes.</td>
    </tr>
    <tr>
      <td><strong>Shell</strong></td>
      <td>Command-line interface (CLI) that processes user input and executes kernel-level system operations.</td>
    </tr>
    <tr>
      <td><strong>System Utility</strong></td>
      <td>User-space applications and system tools that expose OS functionalities to administrators and programs.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Filesystem Hierarchy Standard (FHS)</strong></h4>
<p class="lead mb-4">Standardized directory layout organizing system binaries, configuration files, mount points, and ephemeral data:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Path</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/</code></td>
      <td>The root directory containing all core system dependencies before other filesystems are mounted.</td>
    </tr>
    <tr>
      <td><code>/bin</code></td>
      <td>Essential system command binaries required for basic system operation and single-user recovery.</td>
    </tr>
    <tr>
      <td><code>/boot</code></td>
      <td>Static bootloader configuration, initramfs images, and the Linux kernel executable.</td>
    </tr>
    <tr>
      <td><code>/dev</code></td>
      <td>Special device node files that represent attached physical and virtual hardware devices.</td>
    </tr>
    <tr>
      <td><code>/etc</code></td>
      <td>Local system-wide configuration files and application setting directives.</td>
    </tr>
    <tr>
      <td><code>/home</code></td>
      <td>Personal storage subdirectories for non-root system users.</td>
    </tr>
    <tr>
      <td><code>/lib</code></td>
      <td>Essential shared library files and kernel modules required for system boot and binaries in <code>/bin</code>.</td>
    </tr>
    <tr>
      <td><code>/media</code></td>
      <td>Automatic mount point for removable media devices (USB drives, optical media).</td>
    </tr>
    <tr>
      <td><code>/mnt</code></td>
      <td>Temporary mount point location for manually attached filesystems.</td>
    </tr>
    <tr>
      <td><code>/opt</code></td>
      <td>Installation target for standalone, third-party application software packages.</td>
    </tr>
    <tr>
      <td><code>/root</code></td>
      <td>Home directory specifically reserved for the administrative root user.</td>
    </tr>
    <tr>
      <td><code>/sbin</code></td>
      <td>Essential binary executables reserved for system administration and root tasks.</td>
    </tr>
    <tr>
      <td><code>/tmp</code></td>
      <td>Storage location for temporary files created by the OS and applications (typically cleared at reboot).</td>
    </tr>
    <tr>
      <td><code>/usr</code></td>
      <td>Secondary hierarchy containing user read-only data, multi-user utilities, libraries, and documentation.</td>
    </tr>
    <tr>
      <td><code>/var</code></td>
      <td>Variable data files that persist across boots, such as system log files, mail spools, and databases.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.2 Prompt Description {#ch3.2-prompt-description}

<h4 class="mb-2"><strong>&gt; Bash Prompt &amp; Environmental Customization</strong></h4>
<p class="lead mb-4">An overview of prompt indicators, environment variables, and special formatting escape sequences for terminal customization and logging:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Prompt Type</th>
      <th>Structure / Indicator</th>
      <th>Context &amp; Operational Meaning</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Default Standard User</strong></td>
      <td><code>&lt;username&gt;@&lt;hostname&gt;[&sim;]$</code></td>
      <td>Standard unprivileged prompt indicating current user, system hostname, working directory (<code>~</code> = home), and ending with a <code>$</code> operator.</td>
    </tr>
    <tr>
      <td><strong>Default Privileged (Root)</strong></td>
      <td><code>root@&lt;hostname&gt;[/path]#</code></td>
      <td>Elevated administrative session indicated by the <code>root</code> user context and ending with a <code>#</code> operator.</td>
    </tr>
    <tr>
      <td><strong>Minimal Unprivileged Shell</strong></td>
      <td><code>$</code></td>
      <td>Basic shell prompt displayed when environmental variables (such as <code>PS1</code>) are uninitialized or stripped (e.g., non-interactive reverse shells).</td>
    </tr>
    <tr>
      <td><strong>Minimal Privileged Shell</strong></td>
      <td><code>#</code></td>
      <td>Minimal shell prompt indicating elevated root access without environment formatting.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Prompt Format Identifiers (PS1 Escape Sequences)</strong></h4>
<p class="lead mb-4">Special dynamic escape sequences configured within shell configuration files (e.g., <code>~/.bashrc</code>) to customize the primary prompt variable (<code>PS1</code>):</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Special Character</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>\d</code></td>
      <td>Current date formatted as day, month, and date (e.g., <code>Mon Feb 6</code>).</td>
    </tr>
    <tr>
      <td><code>\D{%Y-%m-%d}</code></td>
      <td>Custom formatted date string using standard <code>strftime</code> parameters (e.g., <code>YYYY-MM-DD</code>).</td>
    </tr>
    <tr>
      <td><code>\H</code></td>
      <td>Full Fully Qualified Domain Name (FQDN) hostname.</td>
    </tr>
    <tr>
      <td><code>\j</code></td>
      <td>Total number of active background jobs currently managed by the shell session.</td>
    </tr>
    <tr>
      <td><code>\n</code></td>
      <td>Inserts a newline character into the prompt string.</td>
    </tr>
    <tr>
      <td><code>\r</code></td>
      <td>Inserts a carriage return character.</td>
    </tr>
    <tr>
      <td><code>\s</code></td>
      <td>Name of the active shell executable (e.g., <code>bash</code>).</td>
    </tr>
    <tr>
      <td><code>\t</code></td>
      <td>Current system time in 24-hour format (<code>HH:MM:SS</code>).</td>
    </tr>
    <tr>
      <td><code>\T</code></td>
      <td>Current system time in 12-hour format (<code>HH:MM:SS</code>).</td>
    </tr>
    <tr>
      <td><code>\@</code></td>
      <td>Current system time in 12-hour AM/PM format.</td>
    </tr>
    <tr>
      <td><code>\u</code></td>
      <td>Username of the current effective user session.</td>
    </tr>
    <tr>
      <td><code>\w</code></td>
      <td>Full path string of the current working directory.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.3 System Information {#ch3.3-system-information}

<h4 class="mb-2"><strong>&gt; System Information Utilities</strong></h4>
<p class="lead mb-4">Core command-line utilities used to audit environment states, active sessions, hardware specs, and system identity:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Command</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>whoami</code></td>
      <td>Displays the effective username of the active shell session.</td>
    </tr>
    <tr>
      <td><code>id</code></td>
      <td>Returns real and effective user (UID) and group IDs (GID), along with supplemental group memberships.</td>
    </tr>
    <tr>
      <td><code>hostname</code></td>
      <td>Prints or configures the network node name of the current host system.</td>
    </tr>
    <tr>
      <td><code>uname</code></td>
      <td>Prints core system architecture details, including kernel name, release version, and machine hardware type.</td>
    </tr>
    <tr>
      <td><code>pwd</code></td>
      <td>Prints the absolute path string of the current working directory.</td>
    </tr>
    <tr>
      <td><code>ifconfig</code></td>
      <td>Legacy utility used to view, assign, or configure network interface parameters and addresses.</td>
    </tr>
    <tr>
      <td><code>ip</code></td>
      <td>Modern network management utility used to view or manipulate routing, network interfaces, devices, and tunnels.</td>
    </tr>
    <tr>
      <td><code>netstat</code></td>
      <td>Displays active network connections, routing tables, and interface statistics.</td>
    </tr>
    <tr>
      <td><code>ss</code></td>
      <td>Modern socket statistics utility used to inspect open TCP/UDP sockets and network states.</td>
    </tr>
    <tr>
      <td><code>ps</code></td>
      <td>Captures a static snapshot of currently running processes and their states.</td>
    </tr>
    <tr>
      <td><code>who</code></td>
      <td>Displays a list of users currently logged into the local host system.</td>
    </tr>
    <tr>
      <td><code>env</code></td>
      <td>Prints active environment variables or executes a program within a modified environment.</td>
    </tr>
    <tr>
      <td><code>lsblk</code></td>
      <td>Lists information about all available block devices (drives, partitions) in a tree layout.</td>
    </tr>
    <tr>
      <td><code>lsusb</code></td>
      <td>Lists connected USB buses and detailed information about attached USB devices.</td>
    </tr>
    <tr>
      <td><code>lsof</code></td>
      <td>Lists open files and the active processes that opened them.</td>
    </tr>
    <tr>
      <td><code>lspci</code></td>
      <td>Lists all PCI devices and buses attached to the motherboard.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Remote Access via SSH</strong></h4>
<p class="lead mb-4">Connecting to remote headless servers and target nodes using encrypted shell connections:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action</th>
      <th>Syntax / Example Command</th>
      <th>Operational Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>SSH Authentication</strong></td>
      <td><code>ssh user@&lt;IP_ADDRESS&gt;</code></td>
      <td>Establishes a secure, low-overhead command-line shell session over network transport.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Primary Situational Awareness Commands</strong></h4>
<p class="lead mb-4">Command execution examples for initial host enumeration and system profiling:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Target Check</th>
      <th>Command</th>
      <th>Sample Output / Security Relevance</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>System Hostname</strong></td>
      <td><code>hostname</code></td>
      <td>Returns system node name (e.g., <code>nixfund</code>).</td>
    </tr>
    <tr>
      <td><strong>Active User</strong></td>
      <td><code>whoami</code></td>
      <td>Confirms user identity execution context (e.g., <code>cry0l1t3</code>).</td>
    </tr>
    <tr>
      <td><strong>Group &amp; Rights Audit</strong></td>
      <td><code>id</code></td>
      <td>Identifies group memberships such as <code>sudo</code> (root escalation potential), <code>adm</code> (log readability in <code>/var/log</code>), or non-standard custom groups.</td>
    </tr>
    <tr>
      <td><strong>Full System Info</strong></td>
      <td><code>uname -a</code></td>
      <td>Prints complete system overview: kernel name, hostname, kernel release, build architecture, and OS string.</td>
    </tr>
    <tr>
      <td><strong>Kernel Version Audit</strong></td>
      <td><code>uname -r</code></td>
      <td>Prints exact kernel release (e.g., <code>4.15.0-99-generic</code>) for kernel vulnerability and exploit mapping.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Uname Flag Breakdown</strong></h4>
<p class="lead mb-4">Core command flags available under <code>uname(1)</code> for granular system identification:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Flag</th>
      <th>Output Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>-a</code>, <code>--all</code></td>
      <td>Prints all system information except omitted unpopulated processor/platform flags.</td>
    </tr>
    <tr>
      <td><code>-s</code>, <code>--kernel-name</code></td>
      <td>Prints the operating system kernel name (e.g., <code>Linux</code>).</td>
    </tr>
    <tr>
      <td><code>-n</code>, <code>--nodename</code></td>
      <td>Prints the network node hostname.</td>
    </tr>
    <tr>
      <td><code>-r</code>, <code>--kernel-release</code></td>
      <td>Prints the exact release version of the operating kernel.</td>
    </tr>
    <tr>
      <td><code>-v</code>, <code>--kernel-version</code></td>
      <td>Prints the internal kernel build version timestamp and distribution tags.</td>
    </tr>
    <tr>
      <td><code>-m</code>, <code>--machine</code></td>
      <td>Prints the system architecture hardware identifier (e.g., <code>x86_64</code>).</td>
    </tr>
    <tr>
      <td><code>-p</code>, <code>--processor</code></td>
      <td>Prints processor type (non-portable).</td>
    </tr>
    <tr>
      <td><code>-i</code>, <code>--hardware-platform</code></td>
      <td>Prints hardware platform (non-portable).</td>
    </tr>
    <tr>
      <td><code>-o</code>, <code>--operating-system</code></td>
      <td>Prints the name of the operating system distribution family.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.4 Find Files and Directories {#ch3.4-find-files-and-directories}

<h4 class="mb-2"><strong>&gt; File &amp; Directory Search Tools</strong></h4>
<p class="lead mb-4">Command-line utilities for locating binary executables, searching filesystem paths with specific criteria, and performing high-speed database queries:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Tool</th>
      <th>Search Mechanism</th>
      <th>Primary Use Case &amp; Operational Features</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>which</code></td>
      <td>Searches executable paths defined in the active user's <code>$PATH</code> environment variable.</td>
      <td>Verifies presence and binary location of specific tools and interpreters (e.g., <code>python</code>, <code>nc</code>, <code>curl</code>).</td>
    </tr>
    <tr>
      <td><code>find</code></td>
      <td>Performs real-time recursive searches directly against the filesystem hierarchy.</td>
      <td>Supports granular filter parameters (file type, owner, size, modification timestamps) and inline command execution (<code>-exec</code>).</td>
    </tr>
    <tr>
      <td><code>locate</code></td>
      <td>Queries an indexed local database (<code>mlocate</code> / <code>plocate</code>) instead of traversing the filesystem.</td>
      <td>Delivers near-instantaneous search results across the OS; requires database updating via <code>updatedb</code>.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Command Execution Examples</strong></h4>
<p class="lead mb-4">Syntax examples for locating binaries and running rapid indexed searches across the host:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action</th>
      <th>Syntax / Command</th>
      <th>Description / Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Locate Binary Path</strong></td>
      <td><code>which python</code></td>
      <td>Returns absolute path string (e.g., <code>/usr/bin/python</code>). Returns empty if binary is missing.</td>
    </tr>
    <tr>
      <td><strong>Update Indexed Database</strong></td>
      <td><code>sudo updatedb</code></td>
      <td>Refreshes the local file index database required by <code>locate</code>.</td>
    </tr>
    <tr>
      <td><strong>Indexed Extension Search</strong></td>
      <td><code>locate *.conf</code></td>
      <td>Rapidly queries the local database for all indexed files ending with <code>.conf</code>.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Granular File Searching (`find` Filter Options)</strong></h4>
<p class="lead mb-4">Breakdown of criteria flags used to perform targeted file searches and command execution:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Parameter / Option</th>
      <th>Type / Argument</th>
      <th>Functional Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/</code></td>
      <td>Target Path</td>
      <td>Defines the starting search directory (root filesystem).</td>
    </tr>
    <tr>
      <td><code>-type f</code></td>
      <td>Object Filter</td>
      <td>Restricts search criteria strictly to standard regular files (excludes directories, sockets, devices).</td>
    </tr>
    <tr>
      <td><code>-name *.conf</code></td>
      <td>Pattern Match</td>
      <td>Matches file names matching wildcards (e.g., all files ending in <code>.conf</code>).</td>
    </tr>
    <tr>
      <td><code>-user root</code></td>
      <td>Ownership Filter</td>
      <td>Filters results to match files explicitly owned by the <code>root</code> account.</td>
    </tr>
    <tr>
      <td><code>-size +20k</code></td>
      <td>Size Threshold</td>
      <td>Filters results to include only files larger than 20 KiB in size.</td>
    </tr>
    <tr>
      <td><code>-newermt 2020-03-03</code></td>
      <td>Timestamp Filter</td>
      <td>Matches files with modification times newer than the specified date string.</td>
    </tr>
    <tr>
      <td><code>-exec ls -al {} \;</code></td>
      <td>Command Execution</td>
      <td>Runs <code>ls -al</code> against every discovered file path placeholder (<code>{}</code>). Escaped semicolon (<code>\;</code>) terminates the inline command.</td>
    </tr>
    <tr>
      <td><code>2&gt;/dev/null</code></td>
      <td>I/O Redirection</td>
      <td>Redirects <code>STDERR</code> error messages (permission denied warnings) to the null device to maintain clean output.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.5 File Descriptors and Redirections {#ch3.5-file-descriptors-and-redirections}

<h4 class="mb-2"><strong>&gt; File Descriptors (FD) Overview</strong></h4>
<p class="lead mb-4">Standard kernel-level integer handles used by Linux to manage input and output streams across active processes:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>FD Value</th>
      <th>Standard Stream</th>
      <th>Data Flow Direction</th>
      <th>Default Target Device</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>0</code></td>
      <td><strong>STDIN</strong></td>
      <td>Standard Input</td>
      <td>Keyboard / Terminal Input</td>
    </tr>
    <tr>
      <td><code>1</code></td>
      <td><strong>STDOUT</strong></td>
      <td>Standard Output</td>
      <td>Terminal Display Screen</td>
    </tr>
    <tr>
      <td><code>2</code></td>
      <td><strong>STDERR</strong></td>
      <td>Standard Error</td>
      <td>Terminal Display Screen</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Redirection Operators &amp; Syntax</strong></h4>
<p class="lead mb-4">Standard operators for controlling input sources, output destinations, file writing modes, and error suppression:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Operator</th>
      <th>Functional Purpose</th>
      <th>Behavior &amp; Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>&gt;</code></td>
      <td>Overwrite Output</td>
      <td>Redirects <code>STDOUT</code> (or specified FD) to a target file. Overwrites existing contents or creates a new file.</td>
    </tr>
    <tr>
      <td><code>&gt;&gt;</code></td>
      <td>Append Output</td>
      <td>Appends <code>STDOUT</code> to the end of a target file without overwriting existing data.</td>
    </tr>
    <tr>
      <td><code>&lt;</code></td>
      <td>Input Redirection</td>
      <td>Passes file contents as <code>STDIN</code> into a specified command.</td>
    </tr>
    <tr>
      <td><code>&lt;&lt;</code></td>
      <td>Heredoc Stream</td>
      <td>Reads multi-line <code>STDIN</code> input continuously until a specified delimiter (e.g., <code>EOF</code>) is encountered.</td>
    </tr>
    <tr>
      <td><code>2&gt;/dev/null</code></td>
      <td>Error Suppression</td>
      <td>Redirects <code>STDERR</code> data directly to the null pseudo-device, discarding all error messages.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Practical Redirection &amp; Piping Examples</strong></h4>
<p class="lead mb-4">Execution examples showing file descriptor management, stream separation, and multi-stage pipeline chaining:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Use Case</th>
      <th>Command / Syntax Example</th>
      <th>Operational Explanation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Suppress Errors</strong></td>
      <td><code>find /etc/ -name shadow 2&gt;/dev/null</code></td>
      <td>Discards all "Permission denied" error messages (<code>FD 2</code>) to display clean query output.</td>
    </tr>
    <tr>
      <td><strong>Save STDOUT Only</strong></td>
      <td><code>find /etc/ -name shadow 2&gt;/dev/null &gt; results.txt</code></td>
      <td>Suppresses errors and writes clean <code>STDOUT</code> results into <code>results.txt</code>.</td>
    </tr>
    <tr>
      <td><strong>Split STDOUT &amp; STDERR</strong></td>
      <td><code>find /etc/ -name shadow 2&gt; stderr.txt 1&gt; stdout.txt</code></td>
      <td>Separates operational output (<code>FD 1</code>) and error logs (<code>FD 2</code>) into two distinct files.</td>
    </tr>
    <tr>
      <td><strong>Read File as STDIN</strong></td>
      <td><code>cat &lt; stdout.txt</code></td>
      <td>Pipes the content of <code>stdout.txt</code> directly into the standard input stream of <code>cat</code>.</td>
    </tr>
    <tr>
      <td><strong>Append STDOUT to File</strong></td>
      <td><code>find /etc/ -name passwd &gt;&gt; stdout.txt 2&gt;/dev/null</code></td>
      <td>Appends query results to <code>stdout.txt</code> while suppressing error output.</td>
    </tr>
    <tr>
      <td><strong>Heredoc File Creation</strong></td>
      <td><code>cat &lt;&lt; EOF &gt; stream.txt</code></td>
      <td>Opens an interactive multi-line input stream that terminates and writes to <code>stream.txt</code> upon typing <code>EOF</code>.</td>
    </tr>
    <tr>
      <td><strong>Single Output Pipeline</strong></td>
      <td><code>find /etc/ -name *.conf 2&gt;/dev/null | grep systemd</code></td>
      <td>Passes suppressed query output to <code>grep</code> to match lines containing the string <code>systemd</code>.</td>
    </tr>
    <tr>
      <td><strong>Multi-Stage Pipeline</strong></td>
      <td><code>find /etc/ -name *.conf 2&gt;/dev/null | grep systemd | wc -l</code></td>
      <td>Chains multiple commands together using pipes (<code>|</code>) to filter matched entries and calculate line counts with <code>wc -l</code>.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.6 Filter Contents {#ch3.6-filter-contents}

<h4 class="mb-2"><strong>&gt; Terminal Pagers &amp; Line Selection Utilities</strong></h4>
<p class="lead mb-4">Command-line tools for viewing, navigating, and capturing line subsets from files or standard input streams:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Tool</th>
      <th>Primary Function</th>
      <th>Key Features &amp; Operational Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>more</code></td>
      <td>Forward-only terminal pager</td>
      <td>Displays file content one screen at a time. Pressing <code>Q</code> exits the pager while leaving printed output rendered on the terminal.</td>
    </tr>
    <tr>
      <td><code>less</code></td>
      <td>Bidirectional terminal pager</td>
      <td>Offers advanced forward/backward navigation and string search. Pressing <code>Q</code> exits the pager and cleans the terminal buffer.</td>
    </tr>
    <tr>
      <td><code>head</code></td>
      <td>Beginning line extractor</td>
      <td>Outputs the first $N$ lines of a file or stream (defaults to 10 lines).</td>
    </tr>
    <tr>
      <td><code>tail</code></td>
      <td>Ending line extractor</td>
      <td>Outputs the last $N$ lines of a file or stream (defaults to 10 lines). Commonly used with <code>-f</code> to follow live file updates.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Text Processing &amp; Filtering Utilities</strong></h4>
<p class="lead mb-4">Core command-line tools for sorting, field splitting, pattern matching, stream editing, and formatting text data:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Tool</th>
      <th>Operational Role</th>
      <th>Common Flags / Syntax</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>sort</code></td>
      <td>Line sorting</td>
      <td>Alphabetizes or numerically orders lines (<code>-n</code> for numeric, <code>-r</code> for reverse, <code>-u</code> for unique).</td>
    </tr>
    <tr>
      <td><code>grep</code></td>
      <td>Pattern matching</td>
      <td>Filters input using strings or regular expressions. <code>-v</code> inverts matches; <code>-i</code> enables case-insensitive search.</td>
    </tr>
    <tr>
      <td><code>cut</code></td>
      <td>Delimiter-based field extraction</td>
      <td>Splits text by delimiter string (<code>-d</code>) and extracts specified column positions (<code>-f</code>).</td>
    </tr>
    <tr>
      <td><code>tr</code></td>
      <td>Character translation &amp; deletion</td>
      <td>Replaces targeted characters with specified replacements (e.g., converting delimiters to spaces).</td>
    </tr>
    <tr>
      <td><code>column</code></td>
      <td>Text tabularization</td>
      <td>Formats unaligned or delimiter-separated input into clean tabular columns (<code>-t</code>).</td>
    </tr>
    <tr>
      <td><code>awk</code></td>
      <td>Pattern scanning &amp; field processing</td>
      <td>Processes text records by field. Variables like <code>$1</code> reference first field and <code>$NF</code> reference the final field.</td>
    </tr>
    <tr>
      <td><code>sed</code></td>
      <td>Stream editor for text transformation</td>
      <td>Performs inline text replacements and regex substitutions using the expression <code>s/find/replace/g</code>.</td>
    </tr>
    <tr>
      <td><code>wc</code></td>
      <td>Word, line, and byte counter</td>
      <td>Counts total lines (<code>-l</code>), words (<code>-w</code>), or characters/bytes (<code>-c</code>) from input streams.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Command Execution Examples</strong></h4>
<p class="lead mb-4">Clear usage syntax and practical execution examples for text transformation pipelines:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Use Case</th>
      <th>Command / Syntax Example</th>
      <th>Output Summary / Result</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Page File Contents</strong></td>
      <td><code>less /etc/passwd</code></td>
      <td>Opens interactive scrollable view of system accounts without leaving text on shell exit.</td>
    </tr>
    <tr>
      <td><strong>View File Tops / Bottoms</strong></td>
      <td><code>head -n 5 /etc/passwd</code></td>
      <td>Extracts only the first 5 lines of <code>/etc/passwd</code>.</td>
    </tr>
    <tr>
      <td><strong>Sort Alphabetically</strong></td>
      <td><code>cat /etc/passwd | sort</code></td>
      <td>Orders lines alphabetically starting from user account names.</td>
    </tr>
    <tr>
      <td><strong>Filter Active Shells</strong></td>
      <td><code>grep "/bin/bash" /etc/passwd</code></td>
      <td>Filters entries to display only accounts assigned an interactive <code>/bin/bash</code> shell.</td>
    </tr>
    <tr>
      <td><strong>Invert Match (Exclude)</strong></td>
      <td><code>grep -v "nologin\|false" /etc/passwd</code></td>
      <td>Excludes service accounts configured with disabled interactive logins.</td>
    </tr>
    <tr>
      <td><strong>Extract Specific Field</strong></td>
      <td><code>cut -d":" -f1 /etc/passwd</code></td>
      <td>Splits line by colon (<code>:</code>) and extracts field 1 (usernames).</td>
    </tr>
    <tr>
      <td><strong>Replace Characters</strong></td>
      <td><code>tr ":" " " &lt; /etc/passwd</code></td>
      <td>Replaces all colon characters (<code>:</code>) with spaces across the stream.</td>
    </tr>
    <tr>
      <td><strong>Format into Table</strong></td>
      <td><code>cat /etc/passwd | tr ":" " " | column -t</code></td>
      <td>Aligns space-separated account details into formatted columns.</td>
    </tr>
    <tr>
      <td><strong>Extract First &amp; Last Field</strong></td>
      <td><code>awk -F":" '{print $1, $NF}' /etc/passwd</code></td>
      <td>Uses <code>:</code> delimiter to print user account name (<code>$1</code>) and assigned shell path (<code>$NF</code>).</td>
    </tr>
    <tr>
      <td><strong>Global String Replacement</strong></td>
      <td><code>sed 's/bin/HTB/g' /etc/passwd</code></td>
      <td>Substitutes every occurrence of string <code>bin</code> with <code>HTB</code> across the output.</td>
    </tr>
    <tr>
      <td><strong>Count Filtered Lines</strong></td>
      <td><code>grep -c "/bin/bash" /etc/passwd</code></td>
      <td>Returns total integer count of lines matching the specified string.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.7 Regular Expressions {#ch3.7-regular-expressions}

<h4 class="mb-2"><strong>&gt; RegEx Metacharacters &amp; Grouping Operators</strong></h4>
<p class="lead mb-4">Core grouping, set definition, and quantification operators used in regular expressions for pattern matching and text filtering:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Operator / Symbol</th>
      <th>Class Type</th>
      <th>Functional Description &amp; Behavioral Scope</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>(...)</code></td>
      <td>Group Operator</td>
      <td>Captures and groups multiple characters or sub-patterns together for isolated logical evaluation or alternation.</td>
    </tr>
    <tr>
      <td><code>[...]</code></td>
      <td>Character Set / Class</td>
      <td>Matches any single character listed inside the brackets (e.g., <code>[a-z]</code> matches any lowercase character).</td>
    </tr>
    <tr>
      <td><code>{min,max}</code></td>
      <td>Quantifier</td>
      <td>Specifies the explicit minimum and maximum repetition count for the preceding character or group.</td>
    </tr>
    <tr>
      <td><code>|</code></td>
      <td>Alternation (OR)</td>
      <td>Logical OR operator that matches if either the preceding or following pattern expression is satisfied.</td>
    </tr>
    <tr>
      <td><code>.*</code></td>
      <td>Sequence Match (AND)</td>
      <td>Combines match-any <code>.</code> with zero-or-more <code>*</code> to act as a logical AND, matching two strings in ordered sequence.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Practical Extended RegEx (`grep -E`) Examples</strong></h4>
<p class="lead mb-4">Command execution examples demonstrating logical OR, logical AND sequence matching, and equivalent pipeline operations:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Match Type</th>
      <th>Syntax / Command Example</th>
      <th>Operational Behavior &amp; Matched Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Logical OR Match</strong></td>
      <td><code>grep -E "(my|false)" /etc/passwd</code></td>
      <td>Returns lines containing either the string <code>my</code> OR the string <code>false</code>. Requires Extended RegEx (<code>-E</code>).</td>
    </tr>
    <tr>
      <td><strong>Logical AND Sequence</strong></td>
      <td><code>grep -E "(my.*false)" /etc/passwd</code></td>
      <td>Returns lines where the string <code>my</code> appears first, followed by zero or more characters, and then the string <code>false</code>.</td>
    </tr>
    <tr>
      <td><strong>Piped AND Equivalent</strong></td>
      <td><code>grep "my" /etc/passwd | grep "false"</code></td>
      <td>Achieves logical AND filtering by piping output from the first pattern check into a second pattern evaluation.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.8 Permission Management {#ch3.8-permission-management}

<h4 class="mb-2"><strong>&gt; File &amp; Directory Permission Structure</strong></h4>
<p class="lead mb-4">An operational summary of access permission bits, subject scopes, directory traversal rules, and long-format output structure:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Permission Type</th>
      <th>Symbol / Bit</th>
      <th>File Scope Functionality</th>
      <th>Directory Scope Functionality</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Read</strong></td>
      <td><code>r</code></td>
      <td>Grants ability to view file contents.</td>
      <td>Grants ability to list directory contents (e.g., via <code>ls</code>).</td>
    </tr>
    <tr>
      <td><strong>Write</strong></td>
      <td><code>w</code></td>
      <td>Grants ability to modify or overwrite file contents.</td>
      <td>Grants ability to create, delete, or rename files within the directory.</td>
    </tr>
    <tr>
      <td><strong>Execute</strong></td>
      <td><code>x</code></td>
      <td>Grants ability to run the file as an executable program or script.</td>
      <td>Grants ability to traverse/navigate into the directory (e.g., via <code>cd</code>). Required for nested path access.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Octal Value Calculation Matrix</strong></h4>
<p class="lead mb-4">Numerical assignment model mapping binary bit representations to octal permission scores across User, Group, and Others scopes:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Permission Scope</th>
      <th>User (Owner)</th>
      <th>Group</th>
      <th>Others</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Binary Notation Values</strong></td>
      <td><code>4 2 1</code></td>
      <td><code>4 2 1</code></td>
      <td><code>4 2 1</code></td>
    </tr>
    <tr>
      <td><strong>Binary Bit State Example</strong></td>
      <td><code>1 1 1</code></td>
      <td><code>1 0 1</code></td>
      <td><code>1 0 0</code></td>
    </tr>
    <tr>
      <td><strong>Calculated Octal Score</strong></td>
      <td><code>7</code> (4+2+1)</td>
      <td><code>5</code> (4+0+1)</td>
      <td><code>4</code> (4+0+0)</td>
    </tr>
    <tr>
      <td><strong>String Representation</strong></td>
      <td><code>rwx</code></td>
      <td><code>r-x</code></td>
      <td><code>r--</code></td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Special Permissions (SUID, SGID, Sticky Bit)</strong></h4>
<p class="lead mb-4">Elevated privilege bits and execution hooks critical for system administration and security privilege auditing:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Special Bit</th>
      <th>Representation</th>
      <th>Octal Value</th>
      <th>Operational Behavior &amp; Security Impact</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>SUID</strong> (Set User ID)</td>
      <td><code>s</code> (User <code>x</code> position)</td>
      <td><code>4000</code></td>
      <td>Executes file with permissions of the file owner rather than executing user. High risk for privilege escalation (e.g., GTFOBins).</td>
    </tr>
    <tr>
      <td><strong>SGID</strong> (Set Group ID)</td>
      <td><code>s</code> (Group <code>x</code> position)</td>
      <td><code>2000</code></td>
      <td>Executes file with rights of group owner. In directories, forced inheritance of group ownership on new files.</td>
    </tr>
    <tr>
      <td><strong>Sticky Bit (Executable)</strong></td>
      <td><code>t</code> (Others <code>x</code> position)</td>
      <td><code>1000</code></td>
      <td>Shared directory safety lock. Prevents users from deleting or renaming files owned by others. Executable bit is set for others.</td>
    </tr>
    <tr>
      <td><strong>Sticky Bit (Non-Exec)</strong></td>
      <td><code>T</code> (Others <code>x</code> position)</td>
      <td><code>1000</code></td>
      <td>Sticky bit is active on directory, but execute permission (<code>x</code>) is missing for others, preventing directory traversal.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Permission &amp; Ownership Modification Commands</strong></h4>
<p class="lead mb-4">Command syntax and execution examples for altering file flags, access control matrices, and user ownership:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action</th>
      <th>Command / Syntax Example</th>
      <th>Operational Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Symbolic Permission Add</strong></td>
      <td><code>chmod a+r shell</code></td>
      <td>Adds read permission (<code>+r</code>) to all users (<code>a</code> = all).</td>
    </tr>
    <tr>
      <td><strong>Symbolic Specific Change</strong></td>
      <td><code>chmod u+x,g-w,o=r shell</code></td>
      <td>Grants owner execute, revokes group write, and sets others to strictly read-only.</td>
    </tr>
    <tr>
      <td><strong>Octal Mode Assignment</strong></td>
      <td><code>chmod 754 shell</code></td>
      <td>Sets permissions explicitly: Owner=<code>rwx</code> (7), Group=<code>r-x</code> (5), Others=<code>r--</code> (4).</td>
    </tr>
    <tr>
      <td><strong>Set SUID Bit</strong></td>
      <td><code>chmod 4755 script.sh</code> or <code>chmod u+s script.sh</code></td>
      <td>Applies Set User ID bit to file, allowing execution under owner context.</td>
    </tr>
    <tr>
      <td><strong>Set Sticky Bit</strong></td>
      <td><code>chmod 1777 /shared/dir</code> or <code>chmod +t /shared/dir</code></td>
      <td>Applies sticky bit to public directory to restrict file deletion exclusively to file owners.</td>
    </tr>
    <tr>
      <td><strong>Change User &amp; Group Owner</strong></td>
      <td><code>chown root:root shell</code></td>
      <td>Reassigns both user owner (<code>root</code>) and group owner (<code>root</code>) for the file.</td>
    </tr>
    <tr>
      <td><strong>Recursive Ownership Change</strong></td>
      <td><code>chown -R cry0l1t3:htbteam /opt/scripts</code></td>
      <td>Recursively changes ownership across all subdirectories and nested files.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.9 User Management {#ch3.9-user-management}

<h4 class="mb-2"><strong>&gt; User &amp; Group Management Utilities</strong></h4>
<p class="lead mb-4">Essential command-line tools for managing user accounts, group assignments, elevated privilege execution, and credential policies:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Command</th>
      <th>Functional Purpose</th>
      <th>Key Features &amp; Administrative Scope</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>sudo</code></td>
      <td>Elevated Command Execution</td>
      <td>Executes commands under another user context (defaulting to <code>root</code>) based on access policies defined in <code>/etc/sudoers</code>.</td>
    </tr>
    <tr>
      <td><code>su</code></td>
      <td>User Switching Utility</td>
      <td>Requests target user credentials via PAM to switch user context and launch an interactive shell session (defaults to superuser).</td>
    </tr>
    <tr>
      <td><code>useradd</code></td>
      <td>User Account Creation</td>
      <td>Low-level utility used to build new system user accounts and initialize baseline settings.</td>
    </tr>
    <tr>
      <td><code>userdel</code></td>
      <td>User Account Removal</td>
      <td>Deletes specified user accounts and option flags clean up associated home directories and mail spools.</td>
    </tr>
    <tr>
      <td><code>usermod</code></td>
      <td>User Account Modification</td>
      <td>Modifies user account parameters, including group memberships, default shell path, home directory location, and expiration states.</td>
    </tr>
    <tr>
      <td><code>addgroup</code> / <code>groupadd</code></td>
      <td>Group Creation</td>
      <td>Adds a new security or organizational group identifier to the system configuration files (<code>/etc/group</code>).</td>
    </tr>
    <tr>
      <td><code>delgroup</code> / <code>groupdel</code></td>
      <td>Group Removal</td>
      <td>Deletes an existing group definition from the host system.</td>
    </tr>
    <tr>
      <td><code>passwd</code></td>
      <td>Password Management</td>
      <td>Updates user account passwords and controls credential aging policies in <code>/etc/shadow</code>.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Administrative Execution Examples</strong></h4>
<p class="lead mb-4">Practical command syntax for provisioning accounts, adjusting group access, and switching privilege contexts:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Administrative Action</th>
      <th>Syntax / Command Example</th>
      <th>Operational Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Execute Single Elevated Command</strong></td>
      <td><code>sudo apt update</code></td>
      <td>Runs package index update with elevated <code>root</code> privileges.</td>
    </tr>
    <tr>
      <td><strong>Switch to Root Environment</strong></td>
      <td><code>su -</code></td>
      <td>Switches user context to <code>root</code> while loading a clean root environment and login profile.</td>
    </tr>
    <tr>
      <td><strong>Switch to Specific User</strong></td>
      <td><code>su - htb-student</code></td>
      <td>Switches active interactive terminal session to target account <code>htb-student</code>.</td>
    </tr>
    <tr>
      <td><strong>Create User with Home Dir</strong></td>
      <td><code>sudo useradd -m -s /bin/bash newuser</code></td>
      <td>Creates account <code>newuser</code>, provisions home directory (<code>-m</code>), and sets default shell to Bash (<code>-s</code>).</td>
    </tr>
    <tr>
      <td><strong>Set / Change Account Password</strong></td>
      <td><code>sudo passwd newuser</code></td>
      <td>Prompts interactive password assignment for specified target account.</td>
    </tr>
    <tr>
      <td><strong>Append Secondary Group Access</strong></td>
      <td><code>sudo usermod -aG sudo,adm newuser</code></td>
      <td>Appends account <code>newuser</code> to supplementary groups (<code>sudo</code> and <code>adm</code>) without overwriting existing group memberships (<code>-aG</code>).</td>
    </tr>
    <tr>
      <td><strong>Create System Group</strong></td>
      <td><code>sudo groupadd auditgroup</code></td>
      <td>Provisions new group entity named <code>auditgroup</code>.</td>
    </tr>
    <tr>
      <td><strong>Delete User &amp; Home Directory</strong></td>
      <td><code>sudo userdel -r newuser</code></td>
      <td>Removes target account and recursively purges its home directory path (<code>-r</code>).</td>
    </tr>
  </tbody>
</table>

<br />

### 3.10 Package Management {#ch3.10-package-management}

<h4 class="mb-2"><strong>&gt; Package Management Ecosystem Overview</strong></h4>
<p class="lead mb-4">An operational summary of Linux package managers, system repository tools, language-specific package installers, and version control software:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Tool / Package Manager</th>
      <th>Ecosystem / Type</th>
      <th>Functional Purpose &amp; Operational Scope</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>apt</code></td>
      <td>Debian / Ubuntu / Parrot</td>
      <td>High-level CLI interface providing automated dependency resolution, repository queries, and software installation.</td>
    </tr>
    <tr>
      <td><code>dpkg</code></td>
      <td>Debian Low-Level Core</td>
      <td>Low-level package manager used to build, unpack, install, and audit standalone <code>.deb</code> binary archives. Does not auto-resolve missing dependencies.</td>
    </tr>
    <tr>
      <td><code>aptitude</code></td>
      <td>Debian Interface Front-End</td>
      <td>High-level text-based interactive menu and advanced CLI front-end for <code>dpkg</code> and <code>apt</code>.</td>
    </tr>
    <tr>
      <td><code>snap</code></td>
      <td>Cross-Distro Universal Packaging</td>
      <td>Manages self-contained, sandboxed application packages ("snaps") bundled with all required runtime dependencies.</td>
    </tr>
    <tr>
      <td><code>gem</code></td>
      <td>Ruby Gems Ecosystem</td>
      <td>Standard package manager and front-end used to distribute, update, and manage Ruby libraries and execution tools.</td>
    </tr>
    <tr>
      <td><code>pip</code></td>
      <td>Python Package Index (PyPI)</td>
      <td>Official package installer for Python modules. Downloads dependencies prior to installation to prevent partial software states.</td>
    </tr>
    <tr>
      <td><code>git</code></td>
      <td>Distributed Version Control</td>
      <td>Distributed source control system used to clone repositories, track revision changes, and fetch tool source code directly from platforms like GitHub.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; APT Query &amp; Cache Operations</strong></h4>
<p class="lead mb-4">Command syntax and examples for repository configuration audits, local cache queries, metadata inspection, and package installation:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action</th>
      <th>Syntax / Command Example</th>
      <th>Operational Behavior &amp; Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Repository List Audit</strong></td>
      <td><code>cat /etc/apt/sources.list.d/parrot.list</code></td>
      <td>Displays mirror repository URLs and channel branches (e.g., <code>main</code>, <code>contrib</code>, <code>non-free</code>).</td>
    </tr>
    <tr>
      <td><strong>Search Local Cache</strong></td>
      <td><code>apt-cache search impacket</code></td>
      <td>Queries the local APT database index for matching software packages and descriptions.</td>
    </tr>
    <tr>
      <td><strong>View Metadata &amp; Deps</strong></td>
      <td><code>apt-cache show impacket-scripts</code></td>
      <td>Prints detailed package metadata, maintainer details, target archive size, and dependency requirements.</td>
    </tr>
    <tr>
      <td><strong>List Installed Packages</strong></td>
      <td><code>apt list --installed</code></td>
      <td>Outputs a complete index of all software packages currently installed on the host.</td>
    </tr>
    <tr>
      <td><strong>Install Package (Auto-Yes)</strong></td>
      <td><code>sudo apt install impacket-scripts -y</code></td>
      <td>Fetches package, resolves all dependencies automatically, and suppresses confirmation prompts (<code>-y</code>).</td>
    </tr>
  </tbody>
</table>

<br />

### 3.11 Service and Process Management {#ch3.11-service-and-process-management}

<h4 class="mb-2"><strong>&gt; System Services &amp; Process Architecture</strong></h4>
<p class="lead mb-4">Core concepts of Linux daemons, init management via <code>systemd</code>, process IDs (PID/PPID), and execution tracking:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Service / Component Type</th>
      <th>Primary Functionality</th>
      <th>Operational Behavior &amp; Characteristics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>System Services</strong></td>
      <td>Core Infrastructure Daemons</td>
      <td>Essential startup services initialized at boot (e.g., <code>systemd</code>, hardware interface managers). Required for host stability.</td>
    </tr>
    <tr>
      <td><strong>User-Installed Services</strong></td>
      <td>Application Server Daemons</td>
      <td>Background applications added by administrators (e.g., <code>sshd</code>, <code>apache2</code>). Extends functionality without impacting kernel core.</td>
    </tr>
    <tr>
      <td><strong>Process IDs (PID / PPID)</strong></td>
      <td>Process Table Identifiers</td>
      <td>Unique integer assigned to every active process. Stored under <code>/proc/&lt;PID&gt;</code>. PPID indicates the parent process context.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Service Management (`systemctl` &amp; `journalctl`)</strong></h4>
<p class="lead mb-4">Commands for managing service state, boot behavior, status inspection, and log troubleshooting:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action</th>
      <th>Syntax / Command Example</th>
      <th>Operational Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Start Service</strong></td>
      <td><code>systemctl start ssh</code></td>
      <td>Launches the specified daemon in the background for the active session.</td>
    </tr>
    <tr>
      <td><strong>Check Status</strong></td>
      <td><code>systemctl status ssh</code></td>
      <td>Displays unit file state, current execution status, main PID, CGroup path, and recent log outputs.</td>
    </tr>
    <tr>
      <td><strong>Enable on Boot</strong></td>
      <td><code>systemctl enable ssh</code></td>
      <td>Links service scripts into standard startup targets to execute automatically during boot.</td>
    </tr>
    <tr>
      <td><strong>List Active Services</strong></td>
      <td><code>systemctl list-units --type=service</code></td>
      <td>Displays all active service units currently loaded into memory.</td>
    </tr>
    <tr>
      <td><strong>Inspect Unit Logs</strong></td>
      <td><code>journalctl -u ssh.service --no-pager</code></td>
      <td>Retrieves system log entries specifically recorded for the target service unit without pagination.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Process Signals &amp; Termination Flags</strong></h4>
<p class="lead mb-4">Core Linux signals used with <code>kill</code>, <code>pkill</code>, and <code>killall</code> to control or terminate running processes:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Signal Number</th>
      <th>Signal Name</th>
      <th>Trigger Mechanism / Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>1</code></td>
      <td><strong>SIGHUP</strong></td>
      <td>Sent when the controlling terminal closes. Forces daemon configuration reload.</td>
    </tr>
    <tr>
      <td><code>2</code></td>
      <td><strong>SIGINT</strong></td>
      <td>Interrupt signal issued via <code>[Ctrl] + C</code> in controlling terminal.</td>
    </tr>
    <tr>
      <td><code>3</code></td>
      <td><strong>SIGQUIT</strong></td>
      <td>Quit signal issued via <code>[Ctrl] + D</code>. Produces a core dump and terminates.</td>
    </tr>
    <tr>
      <td><code>9</code></td>
      <td><strong>SIGKILL</strong></td>
      <td>Immediate process termination. Bypasses cleanup hooks; cannot be caught or ignored.</td>
    </tr>
    <tr>
      <td><code>15</code></td>
      <td><strong>SIGTERM</strong></td>
      <td>Standard process termination request allowing graceful resource cleanup.</td>
    </tr>
    <tr>
      <td><code>19</code></td>
      <td><strong>SIGSTOP</strong></td>
      <td>Forcibly halts/pauses process execution. Cannot be caught or handled.</td>
    </tr>
    <tr>
      <td><code>20</code></td>
      <td><strong>SIGTSTP</strong></td>
      <td>Suspends process execution via <code>[Ctrl] + Z</code>. Can be handled or resumed by user.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Job Control &amp; Process Execution States</strong></h4>
<p class="lead mb-4">Commands for managing background tasks, foregrounding jobs, and chaining multi-command execution streams:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Operation</th>
      <th>Syntax / Command Example</th>
      <th>Behavior &amp; Logic Rules</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Suspend Process</strong></td>
      <td><code>[Ctrl] + Z</code></td>
      <td>Sends <code>SIGTSTP</code> to send active foreground application into suspended state.</td>
    </tr>
    <tr>
      <td><strong>List Running Jobs</strong></td>
      <td><code>jobs</code></td>
      <td>Displays active backgrounded and suspended jobs associated with current shell session.</td>
    </tr>
    <tr>
      <td><strong>Background Job</strong></td>
      <td><code>bg</code></td>
      <td>Resumes suspended process execution in the background context.</td>
    </tr>
    <tr>
      <td><strong>Direct Background Start</strong></td>
      <td><code>ping -c 10 www.hackthebox.eu &amp;</code></td>
      <td>Appends trailing <code>&amp;</code> operator to immediately start process in background.</td>
    </tr>
    <tr>
      <td><strong>Foreground Job</strong></td>
      <td><code>fg 1</code></td>
      <td>Brings background job ID <code>1</code> back to active terminal foreground.</td>
    </tr>
    <tr>
      <td><strong>Sequential Execution (Unconditional)</strong></td>
      <td><code>echo '1'; ls MISSING; echo '3'</code></td>
      <td>Semicolon (<code>;</code>) executes sequential commands sequentially, ignoring errors in prior commands.</td>
    </tr>
    <tr>
      <td><strong>Conditional Execution (On Success)</strong></td>
      <td><code>echo '1' &amp;&amp; ls MISSING &amp;&amp; echo '3'</code></td>
      <td>Double ampersand (<code>&amp;&amp;</code>) halts pipeline chain if any preceding command returns non-zero exit code.</td>
    </tr>
    <tr>
      <td><strong>Piped Data Transfer</strong></td>
      <td><code>ps aux | grep ssh</code></td>
      <td>Pipe (<code>|</code>) redirects stdout from left-hand command into stdin of right-hand process.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.12 Task Scheduling {#ch3.12-task-scheduling}

<h4 class="mb-2"><strong>&gt; Task Scheduling Core Concepts &amp; Security Overview</strong></h4>
<p class="lead mb-4">Task scheduling enables automated, time-based execution of administrative scripts, database maintenance, system updates, and backups. In security and auditing contexts, scheduled tasks serve as prominent mechanisms for operational persistence, privileged backdoor execution, and defense evasion testing.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Scheduler System</th>
      <th>Primary Configuration Model</th>
      <th>Operational Precision &amp; Trigger Capabilities</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Systemd Timers</strong></td>
      <td>Pairing Unit Files (<code>.timer</code> + <code>.service</code>)</td>
      <td>High-precision timer triggers (milliseconds/seconds), event-based execution (e.g., boot delays, active unit states), and structured logging via <code>journalctl</code>.</td>
    </tr>
    <tr>
      <td><strong>Cron Daemon</strong></td>
      <td>Tabular Configuration (<code>crontab</code>)</td>
      <td>Time-based recurring execution down to minute-level granularity. Lightweight syntax using standard 5-field date/time masks.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Systemd Timer Setup Workflow</strong></h4>
<p class="lead mb-4">Procedure for provisioning, configuring, and registering a custom <code>systemd</code> timer with an associated service execution unit:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Step / Component</th>
      <th>File Path / Command Syntax</th>
      <th>Configuration Directives &amp; Operational Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Timer Configuration</strong></td>
      <td><code>/etc/systemd/system/mytimer.timer</code></td>
      <td>
        Defines schedule triggers under <code>[Timer]</code>:<br>
        <code>OnBootSec=3min</code> (Executes 3 minutes post-boot)<br>
        <code>OnUnitActiveSec=1hour</code> (Repeats every hour while active)<br>
        <code>WantedBy=timers.target</code>
      </td>
    </tr>
    <tr>
      <td><strong>2. Service Configuration</strong></td>
      <td><code>/etc/systemd/system/mytimer.service</code></td>
      <td>
        Defines execution parameters under <code>[Service]</code>:<br>
        <code>ExecStart=/full/path/to/my/script.sh</code><br>
        <code>WantedBy=multi-user.target</code>
      </td>
    </tr>
    <tr>
      <td><strong>3. Daemon Reload</strong></td>
      <td><code>sudo systemctl daemon-reload</code></td>
      <td>Forces <code>systemd</code> manager to rescan unit directories and load updated unit configurations into memory.</td>
    </tr>
    <tr>
      <td><strong>4. Enable &amp; Start Timer</strong></td>
      <td><code>sudo systemctl enable --now mytimer.timer</code></td>
      <td>Activates the timer unit immediately and configures persistent autostart upon host boot.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Crontab Syntax &amp; Field Matrix</strong></h4>
<p class="lead mb-4">Five-field temporal filter layout used by the Cron daemon to determine exact task execution intervals:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Field Position</th>
      <th>Field Name</th>
      <th>Allowed Values / Operators</th>
      <th>Functional Scope</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>1</code></td>
      <td><strong>Minutes</strong></td>
      <td><code>0-59</code></td>
      <td>Specifies exact minute mark within the hour.</td>
    </tr>
    <tr>
      <td><code>2</code></td>
      <td><strong>Hours</strong></td>
      <td><code>0-23</code></td>
      <td>Specifies exact hour in 24-hour time format.</td>
    </tr>
    <tr>
      <td><code>3</code></td>
      <td><strong>Day of Month</strong></td>
      <td><code>1-31</code></td>
      <td>Specifies calendar day of the month.</td>
    </tr>
    <tr>
      <td><code>4</code></td>
      <td><strong>Month</strong></td>
      <td><code>1-12</code></td>
      <td>Specifies calendar month of the year.</td>
    </tr>
    <tr>
      <td><code>5</code></td>
      <td><strong>Day of Week</strong></td>
      <td><code>0-7</code> (0 and 7 = Sunday)</td>
      <td>Specifies day of the week (Sunday through Saturday).</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Crontab Schedule Examples</strong></h4>
<p class="lead mb-4">Practical entry formats for common recurring automation intervals:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Schedule Objective</th>
      <th>Crontab Syntax Structure</th>
      <th>Temporal Filter Breakdown</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Interval Software Update</strong></td>
      <td><code>0 */6 * * * /path/to/update.sh</code></td>
      <td>Executes at minute 0 of every 6th hour (e.g., 00:00, 06:00, 12:00, 18:00 daily).</td>
    </tr>
    <tr>
      <td><strong>Monthly Script Run</strong></td>
      <td><code>0 0 1 * * /path/to/run_scripts.sh</code></td>
      <td>Executes at 00:00 (midnight) on the 1st day of every month.</td>
    </tr>
    <tr>
      <td><strong>Weekly DB Cleanup</strong></td>
      <td><code>0 0 * * 0 /path/to/clean_db.sh</code></td>
      <td>Executes at 00:00 (midnight) every Sunday (day 0).</td>
    </tr>
    <tr>
      <td><strong>Weekly Backup Task</strong></td>
      <td><code>0 0 * * 7 /path/to/backup.sh</code></td>
      <td>Executes at 00:00 (midnight) every Sunday (day 7 equivalent).</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Systemd Timers vs. Cron Comparison</strong></h4>
<p class="lead mb-4">Technical comparison between modern <code>systemd</code> timer units and traditional <code>cron</code> scheduled jobs:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Feature / Dimension</th>
      <th>Systemd Timers</th>
      <th>Cron Daemon</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Configuration Files</strong></td>
      <td>Separate unit files (<code>.timer</code> and <code>.service</code>) under <code>/etc/systemd/system/</code>.</td>
      <td>Single file entries in <code>/etc/crontab</code> or user-specific files via <code>crontab -e</code>.</td>
    </tr>
    <tr>
      <td><strong>Granularity</strong></td>
      <td>Sub-second precision, calendar events, boot/unit triggers.</td>
      <td>1-minute execution resolution limit.</td>
    </tr>
    <tr>
      <td><strong>Logging &amp; Tracking</strong></td>
      <td>Direct integration with systemd journal via <code>journalctl -u &lt;service&gt;</code>.</td>
      <td>Logged to syslog/cron logs or delivered via local mail output (<code>MAILTO</code>).</td>
    </tr>
    <tr>
      <td><strong>Resource Control</strong></td>
      <td>Full cgroup integration (CPU, memory, IO limits for scheduled tasks).</td>
      <td>No native execution resource capping without external wrappers (e.g., <code>nice</code>, <code>cgroups</code>).</td>
    </tr>
  </tbody>
</table>

<br />

### 3.13 Network Services {#ch3.13-network-services}

<h4 class="mb-2"><strong>&gt; Network Services Overview &amp; Security Context</strong></h4>
<p class="lead mb-4">Core Linux network services, default listening ports, primary use cases, and key attack surface/auditing considerations:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Service Name</th>
      <th>Default Port(s)</th>
      <th>Primary Operational Role</th>
      <th>Penetration Testing &amp; Security Context</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>OpenSSH</strong></td>
      <td><code>TCP/22</code></td>
      <td>Encrypted remote shell access, command execution, and SFTP/SCP file transfer.</td>
      <td>Primary target for credential auditing, key extraction, local port forwarding, and SSH tunneling.</td>
    </tr>
    <tr>
      <td><strong>NFS</strong> (Network File System)</td>
      <td><code>TCP/2049</code></td>
      <td>Centralized network file distribution across Linux/Unix systems.</td>
      <td>Unauthenticated share enumeration, sensitive file retrieval, and privilege escalation via <code>no_root_squash</code>.</td>
    </tr>
    <tr>
      <td><strong>Apache2</strong></td>
      <td><code>TCP/80</code>, <code>TCP/443</code></td>
      <td>Full-featured production HTTP/HTTPS web server hosting dynamic applications.</td>
      <td>Web application attack surface (LFI/RFI, SQLi, upload bypass), configuration auditing, and hosting exploit payloads.</td>
    </tr>
    <tr>
      <td><strong>Python HTTP Server</strong></td>
      <td><code>TCP/8000</code> (configurable)</td>
      <td>Lightweight, on-demand single-line web server for quick local directory hosting.</td>
      <td>Used in post-exploitation for staging binaries, exfiltrating data, and transferring tools to target hosts.</td>
    </tr>
    <tr>
      <td><strong>OpenVPN</strong></td>
      <td><code>UDP/1194</code> (default)</td>
      <td>Encrypted point-to-point network tunneling and remote internal network access.</td>
      <td>Enables secure perimeter traversal into internal assessment labs, engagement networks, or HTB ranges.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Secure Shell (OpenSSH) Management &amp; Access</strong></h4>
<p class="lead mb-4">Commands for package provisioning, service validation, client connections, and main configuration paths:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action</th>
      <th>Command / File Path</th>
      <th>Operational Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Install OpenSSH Server</strong></td>
      <td><code>sudo apt install openssh-server -y</code></td>
      <td>Installs the OpenSSH daemon and generates default host key pairs.</td>
    </tr>
    <tr>
      <td><strong>Verify Daemon Status</strong></td>
      <td><code>systemctl status ssh</code></td>
      <td>Validates if the <code>sshd</code> listener service is actively running and bound to port 22.</td>
    </tr>
    <tr>
      <td><strong>Remote SSH Connection</strong></td>
      <td><code>ssh cry0l1t3@10.129.17.122</code></td>
      <td>Initiates an interactive, encrypted shell session with the specified remote host.</td>
    </tr>
    <tr>
      <td><strong>Configuration File Path</strong></td>
      <td><code>/etc/ssh/sshd_config</code></td>
      <td>Main server configuration file (controls authentication modes, permitted users, port bindings, and root login rules).</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Network File System (NFS) Configuration &amp; Mounting</strong></h4>
<p class="lead mb-4">Key export permissions, share creation steps, and client-side mount operations:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Option / Command</th>
      <th>Type / Context</th>
      <th>Functional Description &amp; Security Impact</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>rw</code> / <code>ro</code></td>
      <td>Export Option</td>
      <td>Grants read-write (<code>rw</code>) or strictly read-only (<code>ro</code>) access to connected client hosts.</td>
    </tr>
    <tr>
      <td><code>no_root_squash</code></td>
      <td>Export Option (High Risk)</td>
      <td>Allows root users on client machines to retain root privileges on the share. Crucial vector for SUID privilege escalation.</td>
    </tr>
    <tr>
      <td><code>root_squash</code></td>
      <td>Export Option</td>
      <td>Maps incoming root user actions to an unprivileged user ID (e.g., <code>nobody</code>/<code>nfsnobody</code>).</td>
    </tr>
    <tr>
      <td><code>sync</code> / <code>async</code></td>
      <td>Export Option</td>
      <td>Forces immediate disk writes before responding (<code>sync</code>) or buffers writes in memory for higher performance (<code>async</code>).</td>
    </tr>
    <tr>
      <td><code>/etc/exports</code></td>
      <td>Config File Path</td>
      <td>Defines local filesystem paths shared over NFS along with authorized client IPs and permission masks.</td>
    </tr>
    <tr>
      <td><strong>Mount Remote Share</strong></td>
      <td><code>mount 10.129.12.17:/path ~/target_nfs</code></td>
      <td>Attaches the remote NFS export to the specified local directory mount point.</td>
    </tr>
  </tbody>
</table>



<h4 class="mb-2"><strong>&gt; Web Server Deployment (Apache2 &amp; Python HTTP)</strong></h4>
<p class="lead mb-4">Configurations for full web hosting and quick payload/file staging servers:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Server Type</th>
      <th>Command / Configuration Example</th>
      <th>Operational Use Case</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Apache2 Installation</strong></td>
      <td><code>sudo apt install apache2 -y</code></td>
      <td>Installs and starts the standard Linux web server environment.</td>
    </tr>
    <tr>
      <td><strong>Apache Directory Config</strong></td>
      <td><code>/etc/apache2/apache2.conf</code></td>
      <td>Global options file defining root web directory permissions (<code>/var/www/html</code>), directory indexing, and access controls.</td>
    </tr>
    <tr>
      <td><strong>Directory Overrides</strong></td>
      <td><code>.htaccess</code></td>
      <td>Directory-level configuration file enabling localized access control and rewrite rules without editing master config files.</td>
    </tr>
    <tr>
      <td><strong>Python Quick Web Server</strong></td>
      <td><code>python3 -m http.server</code></td>
      <td>Spins up an instant HTTP file server on <code>TCP/8000</code> serving files from the current working directory.</td>
    </tr>
    <tr>
      <td><strong>Custom Directory Staging</strong></td>
      <td><code>python3 -m http.server --directory /tmp/staged</code></td>
      <td>Serves files strictly out of a specific directory path rather than the current working path.</td>
    </tr>
    <tr>
      <td><strong>Privileged Port Binding</strong></td>
      <td><code>sudo python3 -m http.server 443</code></td>
      <td>Binds the Python web server to HTTPS port 443 (or port 80) to bypass restrictive outbound client firewall rules.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Virtual Private Network (OpenVPN) Execution</strong></h4>
<p class="lead mb-4">Commands for deploying OpenVPN client/server binaries and establishing encrypted network tunnels:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action</th>
      <th>Command / File Path</th>
      <th>Operational Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Install OpenVPN Package</strong></td>
      <td><code>sudo apt install openvpn -y</code></td>
      <td>Installs OpenVPN core binaries and service components.</td>
    </tr>
    <tr>
      <td><strong>Server Configuration Path</strong></td>
      <td><code>/etc/openvpn/server.conf</code></td>
      <td>Defines network subnets, cryptographic ciphers, routing tables, and interface options for OpenVPN servers.</td>
    </tr>
    <tr>
      <td><strong>Establish VPN Connection</strong></td>
      <td><code>sudo openvpn --config internal.ovpn</code></td>
      <td>Launches OpenVPN client using a profile configuration file (<code>.ovpn</code>) to create an encrypted <code>tun0</code> network adapter.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.14 Working with Web Services {#ch3.14-working-with-web-services}

<h4 class="mb-2"><strong>&gt; Web Server Architecture &amp; Core Concepts</strong></h4>
<p class="lead mb-4">Web servers handle client-server communication by listening on specific network ports (default HTTP/80, HTTPS/443) and processing HTTP/HTTPS requests. Modular architectures allow dynamic extension via server modules, server-side scripting support, and configurable network socket bindings.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Module / Utility</th>
      <th>Primary Functionality</th>
      <th>Operational Use Case</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>mod_ssl</strong></td>
      <td>Transport Layer Security (TLS/SSL) encryption</td>
      <td>Encrypts client-server HTTP communications over port 443.</td>
    </tr>
    <tr>
      <td><strong>mod_proxy</strong></td>
      <td>Reverse proxy &amp; traffic forwarding</td>
      <td>Directs incoming requests to backend application servers or load balancers.</td>
    </tr>
    <tr>
      <td><strong>mod_headers</strong></td>
      <td>HTTP request/response header modification</td>
      <td>Sets custom security headers (e.g., CSP, HSTS) or strips server identifiers.</td>
    </tr>
    <tr>
      <td><strong>mod_rewrite</strong></td>
      <td>Dynamic URL transformation engine</td>
      <td>Rewrites or redirects client request URLs on the fly based on rule conditions.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Apache2 Service Management &amp; Custom Port Binding</strong></h4>
<p class="lead mb-4">Commands for package management, service control, and modifying default listening ports in Apache2:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action</th>
      <th>Command / Configuration Path</th>
      <th>Functional Scope</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Install Apache2</strong></td>
      <td><code>sudo apt install apache2 -y</code></td>
      <td>Installs the Apache HTTP server daemon and baseline configurations.</td>
    </tr>
    <tr>
      <td><strong>Start Web Service</strong></td>
      <td><code>sudo systemctl start apache2</code></td>
      <td>Launches the <code>apache2</code> system daemon to begin listening for connections.</td>
    </tr>
    <tr>
      <td><strong>Port Configuration Path</strong></td>
      <td><code>/etc/apache2/ports.conf</code></td>
      <td>Directs Apache which IP interfaces and TCP ports to bind to (e.g., changing <code>Listen 80</code> to <code>Listen 8080</code>).</td>
    </tr>
    <tr>
      <td><strong>Restart Web Service</strong></td>
      <td><code>sudo systemctl restart apache2</code></td>
      <td>Reloads unit configurations and rebinds active listening sockets.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Command-Line HTTP Interactivity (cURL, Wget &amp; Python)</strong></h4>
<p class="lead mb-4">Comparison of command-line tools used for web server testing, page fetching, and local directory hosting:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Tool / Technique</th>
      <th>Syntax Example</th>
      <th>Execution Behavior &amp; Primary Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>cURL (Headers Only)</strong></td>
      <td><code>curl -I http://localhost:8080</code></td>
      <td>Sends an HTTP HEAD request and prints server response headers directly to STDOUT.</td>
    </tr>
    <tr>
      <td><strong>cURL (Source Fetch)</strong></td>
      <td><code>curl http://localhost</code></td>
      <td>Fetches raw HTTP response body content and streams HTML source directly to STDOUT.</td>
    </tr>
    <tr>
      <td><strong>Wget File Downloader</strong></td>
      <td><code>wget http://localhost</code></td>
      <td>Retrieves web content or binaries over HTTP/FTP and automatically saves the output to a local file (e.g., <code>index.html</code>).</td>
    </tr>
    <tr>
      <td><strong>Python HTTP Module</strong></td>
      <td><code>python3 -m http.server</code></td>
      <td>Instantly provisions a basic web server bound to <code>TCP/8000</code>, serving all contents within the current directory.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.15 Backup and Restore {#ch3.15-backup-and-restore}

<h4 class="mb-2"><strong>&gt; Linux Backup &amp; Restore Solutions</strong></h4>
<p class="lead mb-4">Linux offers diverse backup utilities ranging from high-performance file synchronization engines to fully encrypted backup suites and desktop graphical interfaces.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Tool / Utility</th>
      <th>Primary Mechanism</th>
      <th>Key Features &amp; Security Attributes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Rsync</strong></td>
      <td>Delta-transfer algorithm (transfers modified file portions)</td>
      <td>Fast local/remote file synchronization, attribute preservation (permissions/timestamps), native SSH transport support.</td>
    </tr>
    <tr>
      <td><strong>Duplicity</strong></td>
      <td>Encrypted bandwidth-efficient backup suite</td>
      <td>Generates encrypted, compressed, and incremental/differential backup volumes over standard network protocols (SSH, FTP, S3).</td>
    </tr>
    <tr>
      <td><strong>Déjà Dup</strong></td>
      <td>Graphical frontend for Duplicity/Rsync</td>
      <td>User-friendly GUI interface for scheduling, restoring, and managing encrypted desktop backups.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Rsync Command Operations</strong></h4>
<p class="lead mb-4">Essential command-line operations for provisioning, executing local/remote transfers, and performing restores:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Operation</th>
      <th>Command Syntax</th>
      <th>Functional Breakdown</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Package Installation</strong></td>
      <td><code>sudo apt install rsync -y</code></td>
      <td>Installs the <code>rsync</code> utility via the package manager.</td>
    </tr>
    <tr>
      <td><strong>Basic Remote Backup</strong></td>
      <td><code>rsync -av /path/src user@backup_server:/path/dest</code></td>
      <td>Synchronizes source directory to remote host. Flags: Archive mode (<code>-a</code>, preserves rights/timestamps) and Verbose (<code>-v</code>).</td>
    </tr>
    <tr>
      <td><strong>Incremental &amp; Compressed Backup</strong></td>
      <td><code>rsync -avz --backup --backup-dir=/path/folder --delete /path/src user@backup_server:/path/dest</code></td>
      <td>Enables stream compression (<code>-z</code>), stores incremental changes in <code>--backup-dir</code>, and removes destination files absent in source (<code>--delete</code>).</td>
    </tr>
    <tr>
      <td><strong>Restore Operation</strong></td>
      <td><code>rsync -av user@remote_host:/path/dest /path/src</code></td>
      <td>Reverses the transfer direction to restore remote backup data to the local target path.</td>
    </tr>
    <tr>
      <td><strong>Encrypted Transfer (SSH)</strong></td>
      <td><code>rsync -avz -e ssh /path/src user@backup_server:/path/dest</code></td>
      <td>Tunneling <code>rsync</code> traffic through SSH (<code>-e ssh</code>) to ensure end-to-end confidentiality and integrity.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Unattended Automated Synchronization Workflow</strong></h4>
<p class="lead mb-4">Step-by-step procedure for configuring passwordless, automated Rsync backups via Cron:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Step</th>
      <th>Command / Script Content</th>
      <th>Description &amp; Operational Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Generate SSH Keypair</strong></td>
      <td><code>ssh-keygen -t rsa -b 2048</code></td>
      <td>Creates a passwordless SSH key pair (<code>~/.ssh/id_rsa</code>) for automated authentication.</td>
    </tr>
    <tr>
      <td><strong>2. Deploy Public Key</strong></td>
      <td><code>ssh-copy-id user@backup_server</code></td>
      <td>Appends the public key to the remote target's <code>~/.ssh/authorized_keys</code>.</td>
    </tr>
    <tr>
      <td><strong>3. Create Execution Script</strong></td>
      <td>
        <code>#!/bin/bash</code><br>
        <code>rsync -avz -e ssh /path/src user@backup_server:/path/dest</code>
      </td>
      <td>Wrapper script (<code>RSYNC_Backup.sh</code>) encapsulating the encrypted transfer command.</td>
    </tr>
    <tr>
      <td><strong>4. Set Script Permissions</strong></td>
      <td><code>chmod +x RSYNC_Backup.sh</code></td>
      <td>Grants execution privileges (<code>+x</code>) to the local backup script.</td>
    </tr>
    <tr>
      <td><strong>5. Register Cron Job</strong></td>
      <td><code>0 * * * * /path/to/RSYNC_Backup.sh</code></td>
      <td>Crontab entry configured via <code>crontab -e</code> to execute the backup automatically on the 0th minute of every hour.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.16 File System Management {#ch3.16-file-system-management}

<h4 class="mb-2"><strong>&gt; Linux File Systems Overview</strong></h4>
<p class="lead mb-4">Linux supports diverse file systems optimized for distinct operational needs ranging from high-performance server storage to cross-platform compatibility.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>File System</th>
      <th>Key Features &amp; Architecture</th>
      <th>Primary Use Case</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>ext2</strong></td>
      <td>Non-journaling, low overhead. Vulnerable to corruption on ungraceful shutdown.</td>
      <td>Legacy systems, flash drives, small embedded devices.</td>
    </tr>
    <tr>
      <td><strong>ext3 / ext4</strong></td>
      <td>Journaling support. Default Linux file system offering strong performance, stability, and large file support.</td>
      <td>Standard Linux desktop and server installations.</td>
    </tr>
    <tr>
      <td><strong>Btrfs</strong></td>
      <td>Copy-on-Write (CoW), native snapshotting, built-in RAID, and checksum data integrity checks.</td>
      <td>Advanced storage setups, subvolume management, complex server setups.</td>
    </tr>
    <tr>
      <td><strong>XFS</strong></td>
      <td>High-performance 64-bit journaling file system optimized for parallel I/O and massive files.</td>
      <td>Enterprise database servers and high-density storage arrays.</td>
    </tr>
    <tr>
      <td><strong>NTFS</strong></td>
      <td>Proprietary Windows file system support via standard drivers (FUSE / ntfs-3g).</td>
      <td>Dual-boot setups and shared external drives.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; File System Structure &amp; Inodes</strong></h4>
<p class="lead mb-4">Under the Unix model, files are represented by metadata structures and classified into distinct categories:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Component / File Type</th>
      <th>Data Structure &amp; Behavior</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Inode (Index Node)</strong></td>
      <td>Metadata block (Permissions, Ownership, Size, Timestamps, Block Pointers)</td>
      <td>Stores file attributes and pointers to physical disk data blocks (does not hold filename or actual file data).</td>
    </tr>
    <tr>
      <td><strong>Inode Table</strong></td>
      <td>Kernel database structure</td>
      <td>System index used by the kernel to track all filesystem objects. Exhaustion prevents new file creation even if disk space remains.</td>
    </tr>
    <tr>
      <td><strong>Regular Files</strong></td>
      <td>ASCII text, binary data, executables</td>
      <td>Standard file objects residing within directory structures.</td>
    </tr>
    <tr>
      <td><strong>Directories</strong></td>
      <td>Special file mapping names to inodes</td>
      <td>Container files holding references to regular files and subdirectories.</td>
    </tr>
    <tr>
      <td><strong>Symbolic Links</strong></td>
      <td>Pointer files containing target paths</td>
      <td>Shortcuts linking to target file/directory paths across the filesystem hierarchy.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Storage Management: Partitioning, Mounting &amp; /etc/fstab</strong></h4>
<p class="lead mb-4">Commands and configuration structures used to manage physical disk partitions and mount points:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action / Component</th>
      <th>Command / File Path</th>
      <th>Operational Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>List Partitions</strong></td>
      <td><code>sudo fdisk -l</code></td>
      <td>Displays partition tables, sector boundaries, and storage disk geometry.</td>
    </tr>
    <tr>
      <td><strong>View Mounted Filesystems</strong></td>
      <td><code>mount</code></td>
      <td>Lists currently attached storage devices, mount points, and active permissions.</td>
    </tr>
    <tr>
      <td><strong>Mount Storage Device</strong></td>
      <td><code>sudo mount /dev/sdb1 /mnt/usb</code></td>
      <td>Attaches specified device node (<code>/dev/sdb1</code>) to target directory (<code>/mnt/usb</code>).</td>
    </tr>
    <tr>
      <td><strong>Unmount Storage Device</strong></td>
      <td><code>sudo umount /mnt/usb</code></td>
      <td>Detaches device from filesystem target point (fails if files are currently open/busy).</td>
    </tr>
    <tr>
      <td><strong>Check Open Files</strong></td>
      <td><code>lsof | grep &lt;user/path&gt;</code></td>
      <td>Identifies processes actively holding open file handles preventing unmounts.</td>
    </tr>
    <tr>
      <td><strong>Static Mount Config</strong></td>
      <td><code>/etc/fstab</code></td>
      <td>Configuration file mapping device UUIDs/paths to target mount points, options (e.g., <code>noauto</code>, <code>rw</code>), and boot mount order.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Swap Space &amp; Virtual Memory Management</strong></h4>
<p class="lead mb-4">Swap space extends physical RAM capabilities by offloading inactive memory pages to disk storage:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Utility / Concept</th>
      <th>Command / Description</th>
      <th>Function &amp; Security Impact</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Format Swap Area</strong></td>
      <td><code>mkswap /dev/sdXN</code> (or file)</td>
      <td>Prepares a dedicated partition or file to function as system swap space.</td>
    </tr>
    <tr>
      <td><strong>Activate Swap Area</strong></td>
      <td><code>swapon /dev/sdXN</code></td>
      <td>Enables designated swap space for kernel page swapping operations.</td>
    </tr>
    <tr>
      <td><strong>Hibernation Support</strong></td>
      <td>Swap storage mechanism</td>
      <td>Saves active RAM state to swap space upon power-off and restores execution context on boot.</td>
    </tr>
    <tr>
      <td><strong>Swap Security</strong></td>
      <td>Encryption (e.g., LUKS / dm-crypt)</td>
      <td>Recommended practice to encrypt swap partitions to prevent plain-text exposure of sensitive memory data stored on disk.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.17 Containerization {#ch3.17-containerization}

<h4 class="mb-2"><strong>&gt; Containerization Core Concepts &amp; Architecture</strong></h4>
<p class="lead mb-4">Containerization packages applications and their dependencies into lightweight, isolated execution environments. Unlike Virtual Machines (VMs) which emulate dedicated hardware and run full guest operating systems, containers share the host Linux kernel while using kernel features to enforce isolation.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Technology / Concept</th>
      <th>Kernel Isolation Mechanism</th>
      <th>Primary Function &amp; Architecture</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Namespaces</strong></td>
      <td>Process, Network, Mount, IPC, UTS, User</td>
      <td>Provides process isolation (PID), network interface abstraction (NET), and separate mount trees (MNT).</td>
    </tr>
    <tr>
      <td><strong>Control Groups (cgroups)</strong></td>
      <td>Resource Allocation &amp; Limits</td>
      <td>Controls, limits, and measures resource consumption (CPU, Memory, Disk I/O) per container.</td>
    </tr>
    <tr>
      <td><strong>Docker Engine</strong></td>
      <td>Application Containerization Platform</td>
      <td>Application-centric container platform utilizing layered filesystems (Images) and automated deployment tools.</td>
    </tr>
    <tr>
      <td><strong>Linux Containers (LXC)</strong></td>
      <td>System Containerization Platform</td>
      <td>System-centric container tool creating lightweight, fully functional Linux system environments (OS-like).</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Docker Provisioning &amp; Image Creation Workflow</strong></h4>
<p class="lead mb-4">Commands for installing Docker, building custom images from Dockerfiles, and launching containers with port mappings:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action</th>
      <th>Command / Directive Syntax</th>
      <th>Operational Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Install Docker Engine</strong></td>
      <td><code>sudo apt install docker-ce docker-ce-cli containerd.io -y</code></td>
      <td>Installs core Docker runtime daemons and CLI management utilities.</td>
    </tr>
    <tr>
      <td><strong>Add User to Docker Group</strong></td>
      <td><code>sudo usermod -aG docker htb-student</code></td>
      <td>Grants local user permissions to manage Docker without prefixing <code>sudo</code>.</td>
    </tr>
    <tr>
      <td><strong>Base Image Directive</strong></td>
      <td><code>FROM ubuntu:22.04</code></td>
      <td>Specifies parent base OS image in a <code>Dockerfile</code>.</td>
    </tr>
    <tr>
      <td><strong>Build Image</strong></td>
      <td><code>docker build -t FS_docker .</code></td>
      <td>Compiles instructions inside local <code>Dockerfile</code> into a tagged image (<code>FS_docker</code>).</td>
    </tr>
    <tr>
      <td><strong>Run Container</strong></td>
      <td><code>docker run -p 8022:22 -p 8080:80 -d FS_docker</code></td>
      <td>Spawns detached container (<code>-d</code>), binding host ports <code>8022/8080</code> to container ports <code>22/80</code>.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Docker Management Commands</strong></h4>
<p class="lead mb-4">Standard management CLI operations for monitoring, controlling, and removing Docker lifecycle objects:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Command</th>
      <th>Functional Scope</th>
      <th>Primary Application</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>docker ps</code></td>
      <td>Lists active running containers</td>
      <td>Displays container IDs, active status, and open port forward mappings.</td>
    </tr>
    <tr>
      <td><code>docker stop &lt;container&gt;</code></td>
      <td>Gracefully stops a running container</td>
      <td>Sends SIGTERM to primary process inside container.</td>
    </tr>
    <tr>
      <td><code>docker start &lt;container&gt;</code></td>
      <td>Starts a stopped container</td>
      <td>Re-initiates process execution state for an existing container.</td>
    </tr>
    <tr>
      <td><code>docker restart &lt;container&gt;</code></td>
      <td>Restarts active or hung container</td>
      <td>Flushes and re-executes container entrypoint processes.</td>
    </tr>
    <tr>
      <td><code>docker rm &lt;container&gt;</code></td>
      <td>Deletes stopped container instance</td>
      <td>Cleans up container runtime state from host storage.</td>
    </tr>
    <tr>
      <td><code>docker rmi &lt;image_id&gt;</code></td>
      <td>Deletes cached Docker image</td>
      <td>Removes unused layered filesystem images from disk.</td>
    </tr>
    <tr>
      <td><code>docker logs &lt;container&gt;</code></td>
      <td>Retrieves container STDOUT/STDERR logs</td>
      <td>Inspects execution logs, debugging service errors, and auditing activity.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Linux Containers (LXC) Management &amp; Resource Hardening</strong></h4>
<p class="lead mb-4">Operations for deploying LXC system containers, managing active instances, and setting resource limits via cgroups:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Operation / Setting</th>
      <th>Command / Configuration Path</th>
      <th>Description &amp; Operational Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Install LXC</strong></td>
      <td><code>sudo apt install lxc -y</code></td>
      <td>Installs Linux Containers userspace tools and template scripts.</td>
    </tr>
    <tr>
      <td><strong>Create LXC Container</strong></td>
      <td><code>sudo lxc-create -n linuxcontainer -t ubuntu</code></td>
      <td>Provisions a new system container named <code>linuxcontainer</code> using the Ubuntu template.</td>
    </tr>
    <tr>
      <td><strong>List LXC Containers</strong></td>
      <td><code>lxc-ls</code></td>
      <td>Lists existing LXC containers alongside their current state (RUNNING/STOPPED).</td>
    </tr>
    <tr>
      <td><strong>Attach to Container</strong></td>
      <td><code>lxc-attach -n &lt;container&gt;</code></td>
      <td>Spawns an interactive shell prompt inside the specified target LXC container.</td>
    </tr>
    <tr>
      <td><strong>Resource Config Path</strong></td>
      <td><code>/usr/share/lxc/config/linuxcontainer.conf</code></td>
      <td>Custom per-container configuration file for setting hardware quotas.</td>
    </tr>
    <tr>
      <td><strong>CPU Quota Allocation</strong></td>
      <td><code>lxc.cgroup.cpu.shares = 512</code></td>
      <td>Limits container CPU relative weight to half of default system allocation (512 vs 1024).</td>
    </tr>
    <tr>
      <td><strong>Memory Usage Limit</strong></td>
      <td><code>lxc.cgroup.memory.limit_in_bytes = 512M</code></td>
      <td>Restricts total maximum RAM consumption for the container instance to 512MB.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Technical Comparison: Docker vs. LXC</strong></h4>
<p class="lead mb-4">Feature matrix highlighting structural differences between Docker and LXC environments:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Dimension / Feature</th>
      <th>Docker Platform</th>
      <th>Linux Containers (LXC)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Design Focus</strong></td>
      <td>Application / Microservice Containerization</td>
      <td>System / Lightweight Virtual Machine Containerization</td>
    </tr>
    <tr>
      <td><strong>Image Definition</strong></td>
      <td>Automated via <code>Dockerfile</code> instructions</td>
      <td>Manual rootfs population / Distribution template scripts</td>
    </tr>
    <tr>
      <td><strong>Portability</strong></td>
      <td>High (Standardized registry distribution via Docker Hub)</td>
      <td>Moderate (Tightly bound to underlying host Linux configurations)</td>
    </tr>
    <tr>
      <td><strong>Default Hardening</strong></td>
      <td>Built-in AppArmor/SELinux profiles, read-only layers</td>
      <td>Requires manual security profile and namespace configuration</td>
    </tr>
    <tr>
      <td><strong>State Management</strong></td>
      <td>Stateless design (Requires external volumes)</td>
      <td>Stateful design (Acts like a persistent, lightweight VM host)</td>
    </tr>
  </tbody>
</table>

<br />

### 3.18 Network Configuration {#ch3.18-network-configuration}

<h4 class="mb-2"><strong>&gt; Network Access Control (NAC) Models</strong></h4>
<p class="lead mb-4">Network Access Control models dictate how system permissions and data access rights are granted to users, processes, and network entities.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>NAC Model</th>
      <th>Control Mechanism</th>
      <th>Primary Use Case &amp; Security Profile</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Discretionary Access Control (DAC)</strong></td>
      <td>Resource owner manages access permissions (Read/Write/Execute) for users and groups.</td>
      <td>Standard file system permissions; flexible but vulnerable to user error or compromise.</td>
    </tr>
    <tr>
      <td><strong>Mandatory Access Control (MAC)</strong></td>
      <td>Operating system kernel enforces access based on explicit security labels and clearances.</td>
      <td>High-security environments (government, military, enterprise infrastructure). Prevents lateral movement.</td>
    </tr>
    <tr>
      <td><strong>Role-Based Access Control (RBAC)</strong></td>
      <td>Permissions assigned to predefined organizational roles rather than individual identities.</td>
      <td>Enterprise user management; simplifies privilege auditing and enforcement.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Linux Network Interface Management Commands</strong></h4>
<p class="lead mb-4">Commands for inspecting, activating, assigning IP settings, and setting default routes on network interfaces (Legacy <code>net-tools</code> vs Modern <code>iproute2</code>):</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action</th>
      <th>Legacy Command Syntax (ifconfig/route)</th>
      <th>Modern Command Syntax (iproute2)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>View Interface Status</strong></td>
      <td><code>ifconfig</code></td>
      <td><code>ip addr</code></td>
    </tr>
    <tr>
      <td><strong>Activate Interface</strong></td>
      <td><code>sudo ifconfig eth0 up</code></td>
      <td><code>sudo ip link set eth0 up</code></td>
    </tr>
    <tr>
      <td><strong>Assign IP Address</strong></td>
      <td><code>sudo ifconfig eth0 192.168.1.2</code></td>
      <td><code>sudo ip addr add 192.168.1.2/24 dev eth0</code></td>
    </tr>
    <tr>
      <td><strong>Set Subnet Mask</strong></td>
      <td><code>sudo ifconfig eth0 netmask 255.255.255.0</code></td>
      <td>Included in CIDR notation during IP allocation</td>
    </tr>
    <tr>
      <td><strong>Set Default Gateway</strong></td>
      <td><code>sudo route add default gw 192.168.1.1 eth0</code></td>
      <td><code>sudo ip route add default via 192.168.1.1 dev eth0</code></td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; System DNS &amp; Interface Configuration Files</strong></h4>
<p class="lead mb-4">Configuration files used for local host network configuration and name resolution setup:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Target Configuration File</th>
      <th>Key Parameters &amp; Syntax Examples</th>
      <th>Operational Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/etc/resolv.conf</code></td>
      <td><code>nameserver 8.8.8.8</code><br><code>nameserver 8.8.4.4</code></td>
      <td>Runtime DNS lookup servers. Non-persistent if overwritten by <code>NetworkManager</code> or <code>systemd-resolved</code>.</td>
    </tr>
    <tr>
      <td><code>/etc/network/interfaces</code></td>
      <td>
        <code>auto eth0</code><br>
        <code>iface eth0 inet static</code><br>
        <code>&nbsp;&nbsp;address 192.168.1.2</code><br>
        <code>&nbsp;&nbsp;netmask 255.255.255.0</code><br>
        <code>&nbsp;&nbsp;gateway 192.168.1.1</code><br>
        <code>&nbsp;&nbsp;dns-nameservers 8.8.8.8 8.8.4.4</code>
      </td>
      <td>Static interface mapping file on Debian/Ubuntu systems. Applied persistently via <code>sudo systemctl restart networking</code>.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Network Diagnostics &amp; Security Tools</strong></h4>
<p class="lead mb-4">Utilities used for analyzing network connectivity, packet routes, active open ports, and security traffic:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Tool Utility</th>
      <th>Sample Execution Command</th>
      <th>Diagnostic &amp; Reconnaissance Function</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>ping</strong></td>
      <td><code>ping -c 4 8.8.8.8</code></td>
      <td>Verifies layer-3 ICMP reachability and measures round-trip time (RTT).</td>
    </tr>
    <tr>
      <td><strong>traceroute</strong></td>
      <td><code>traceroute www.inlanefreight.com</code></td>
      <td>Maps hop-by-hop layer-3 route paths using incremental TTL values.</td>
    </tr>
    <tr>
      <td><strong>netstat / ss</strong></td>
      <td><code>netstat -a</code> or <code>ss -tulpn</code></td>
      <td>Displays active TCP/UDP socket connections, listening ports, and running process IDs.</td>
    </tr>
    <tr>
      <td><strong>tcpdump / Wireshark</strong></td>
      <td><code>tcpdump -i eth0 -n host 10.10.10.10</code></td>
      <td>Captures and analyzes raw network packets for threat hunting or credential extraction.</td>
    </tr>
    <tr>
      <td><strong>nmap</strong></td>
      <td><code>nmap -sV -sC -p- 192.168.1.1</code></td>
      <td>Network discovery tool for port scanning, service enumeration, and vulnerability probing.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Linux Security Mechanisms (Hardening)</strong></h4>
<p class="lead mb-4">Host-level controls and Linux kernel modules that restrict application behavior and network access:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Security System</th>
      <th>Architecture &amp; Enforcement Level</th>
      <th>Operational Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Security-Enhanced Linux (SELinux)</strong></td>
      <td>Kernel-integrated Mandatory Access Control (MAC) using explicit type enforcement.</td>
      <td>Enforces low-level granular security rules on files, processes, and sockets to contain compromise.</td>
    </tr>
    <tr>
      <td><strong>AppArmor</strong></td>
      <td>Kernel module-based MAC using path-based application profiles.</td>
      <td>Profile-driven access control restricting specific application capabilities and file system access.</td>
    </tr>
    <tr>
      <td><strong>TCP Wrappers</strong></td>
      <td>Host-based network access control using <code>/etc/hosts.allow</code> and <code>/etc/hosts.deny</code>.</td>
      <td>Filters incoming service requests based on client IP addresses before passing traffic to network daemons.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.19 Remote Desktop Protocols in Linux {#ch3.19-remote-desktop-protocols-in-linux}

<h4 class="mb-2"><strong>&gt; Remote Desktop Protocols Comparison</strong></h4>
<p class="lead mb-4">Remote desktop protocols enable administrators and security testers to access graphical interface sessions across platforms.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Protocol</th>
      <th>Default Network Ports</th>
      <th>Transport Mechanics</th>
      <th>Security Profile</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>RDP (Remote Desktop Protocol)</strong></td>
      <td>TCP/UDP 3389</td>
      <td>Sends screen renders and input commands. Proprietary to Microsoft Windows.</td>
      <td>Supports TLS/NLA encryption natively.</td>
    </tr>
    <tr>
      <td><strong>VNC (Virtual Network Computing)</strong></td>
      <td>TCP 5900+ (5900 + Display #)</td>
      <td>Uses Remote Frame Buffer (RFB) protocol to transmit pixel graphics and input events.</td>
      <td>Basic password auth; data stream unencrypted by default (requires SSH tunneling).</td>
    </tr>
    <tr>
      <td><strong>X11 Forwarding</strong></td>
      <td>TCP 6000–6010 (6000 + Display #)</td>
      <td>Client-side rendering via Unix XServer. Applications render locally on client host.</td>
      <td>Unencrypted natively. Secured by tunneling over SSH (<code>ssh -X</code>).</td>
    </tr>
    <tr>
      <td><strong>XDMCP</strong></td>
      <td>UDP 177</td>
      <td>X Display Manager Control Protocol for managing remote X Window sessions across terminals.</td>
      <td>Insecure protocol; vulnerable to cleartext eavesdropping and MITM attacks.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; X11 Forwarding Configuration &amp; Execution</strong></h4>
<p class="lead mb-4">Enabling remote application rendering using SSH-tunneled X11:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Component / Command</th>
      <th>Configuration Syntax</th>
      <th>Operational Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>SSH Server Config File</strong></td>
      <td><code>/etc/ssh/sshd_config</code></td>
      <td>Host configuration file governing SSH service behavior and feature availability.</td>
    </tr>
    <tr>
      <td><strong>Enable X11 Tunneling</strong></td>
      <td><code>X11Forwarding yes</code></td>
      <td>Directive required inside <code>sshd_config</code> to allow remote GUI forwarding.</td>
    </tr>
    <tr>
      <td><strong>Execute GUI via SSH</strong></td>
      <td><code>ssh -X htb-student@10.129.23.11 /usr/bin/firefox</code></td>
      <td>Establishes encrypted SSH tunnel and renders specified remote application (Firefox) on local display.</td>
    </tr>
    <tr>
      <td><strong>Reconnaissance Tools</strong></td>
      <td><code>xwd</code>, <code>xgrabsc</code></td>
      <td>Utilities that capture screenshots of active X Window sessions if TCP 6000-6010 is exposed without auth.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; TigerVNC Server Setup &amp; Config Workflow</strong></h4>
<p class="lead mb-4">Steps required to install, configure, and start a TigerVNC standalone server with XFCE4 desktop environment:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Action Step</th>
      <th>Execution Command / File Syntax</th>
      <th>Function</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Package Installation</strong></td>
      <td><code>sudo apt install xfce4 xfce4-goodies tigervnc-standalone-server -y</code></td>
      <td>Installs XFCE desktop environment alongside TigerVNC server components.</td>
    </tr>
    <tr>
      <td><strong>2. Set VNC Password</strong></td>
      <td><code>vncpasswd</code></td>
      <td>Generates authentication hash saved in <code>~/.vnc/passwd</code>.</td>
    </tr>
    <tr>
      <td><strong>3. Configure Session Startup</strong></td>
      <td><code>~/.vnc/xstartup</code><br><code>#!/bin/bash</code><br><code>/usr/bin/startxfce4</code></td>
      <td>Executable script defining how the desktop environment initializes upon connection.</td>
    </tr>
    <tr>
      <td><strong>4. Configure Session Properties</strong></td>
      <td><code>~/.vnc/config</code><br><code>geometry=1920x1080</code><br><code>dpi=96</code></td>
      <td>Sets display resolution and DPI properties for new VNC sessions.</td>
    </tr>
    <tr>
      <td><strong>5. Set Permissions &amp; Start</strong></td>
      <td><code>chmod +x ~/.vnc/xstartup &amp;&amp; vncserver</code></td>
      <td>Makes startup script executable and initializes new VNC instance (e.g., Display <code>:1</code> on port 5901).</td>
    </tr>
    <tr>
      <td><strong>6. List Active Sessions</strong></td>
      <td><code>vncserver -list</code></td>
      <td>Displays active display IDs, RFB listening ports, and active process IDs.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Encrypted VNC Tunneling &amp; Connection Commands</strong></h4>
<p class="lead mb-4">Securing unencrypted VNC traffic by routing connection streams through local SSH port forwarding:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Step</th>
      <th>Command</th>
      <th>Operational Mechanics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Establish SSH Tunnel</strong></td>
      <td><code>ssh -L 5901:127.0.0.1:5901 -N -f -l htb-student 10.129.14.130</code></td>
      <td>Binds local port 5901 to loopback address 127.0.0.1:5901 on target host in background (<code>-f -N</code>).</td>
    </tr>
    <tr>
      <td><strong>Connect VNC Viewer</strong></td>
      <td><code>xtightvncviewer localhost:5901</code></td>
      <td>Connects VNC client to local forwarded port, sending all RFB traffic securely through the SSH tunnel.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.20 Linux Security {#ch3.20-linux-security}

<h4 class="mb-2"><strong>&gt; Essential Linux Hardening Best Practices</strong></h4>
<p class="lead mb-4">Securing a Linux host requires an operational process focused on reducing attack surface, enforcing strict access controls, and maintaining continuous patch compliance.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Hardening Vector</th>
      <th>Key Implementation Mechanics</th>
      <th>Security Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>System Updates</strong></td>
      <td><code>apt update &amp;&amp; apt dist-upgrade</code></td>
      <td>Patches known vulnerabilities across installed software dependencies and the system kernel.</td>
    </tr>
    <tr>
      <td><strong>SSH Configuration</strong></td>
      <td>Disable root logins (<code>PermitRootLogin no</code>) and password auth (<code>PasswordAuthentication no</code>).</td>
      <td>Mitigates brute-force attacks and prevents direct administrative exposure over remote access points.</td>
    </tr>
    <tr>
      <td><strong>Least Privilege &amp; Sudo</strong></td>
      <td>Restrict full root access; specify precise commands in <code>/etc/sudoers</code>.</td>
      <td>Limits blast radius if a user account or service context is compromised.</td>
    </tr>
    <tr>
      <td><strong>Intrusion Prevention</strong></td>
      <td>Deploy <code>fail2ban</code> to monitor authentication logs and auto-drop abusive IPs.</td>
      <td>Automatically blocks connection attempts exceeding maximum login failure thresholds.</td>
    </tr>
    <tr>
      <td><strong>Security Auditing</strong></td>
      <td>Audit for misconfigured cron jobs, world-writable files, outdated kernels, and redundant SUID/SGID binaries.</td>
      <td>Prevents local privilege escalation (LPE) vectors on target host.</td>
    </tr>
    <tr>
      <td><strong>Kernel MAC Modules</strong></td>
      <td>Enforce Mandatory Access Control via <code>SELinux</code> or <code>AppArmor</code>.</td>
      <td>Restricts process execution, file access, and network operations based on strict path/type profiles.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Security Audit &amp; System Hardening Tools</strong></h4>
<p class="lead mb-4">Key open-source utilities used by system administrators and security auditors for detection and threat hunting:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Tool Utility</th>
      <th>Primary Functionality</th>
      <th>Deployment Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Lynis</strong></td>
      <td>Automated system security auditing and compliance testing.</td>
      <td>Evaluates overall host security posture, patch levels, and misconfigurations.</td>
    </tr>
    <tr>
      <td><strong>chkrootkit / rkhunter</strong></td>
      <td>Local rootkit, backdoor, and kernel-hook scanner.</td>
      <td>Detects signifiers of active system compromise, rogue binaries, and hidden processes.</td>
    </tr>
    <tr>
      <td><strong>Snort</strong></td>
      <td>Network Intrusion Detection &amp; Prevention System (NIDS/NIPS).</td>
      <td>Monitors real-time network traffic against rule sets to log or block malicious activity.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Host Access Control: TCP Wrappers</strong></h4>
<p class="lead mb-4">TCP Wrappers provide application-layer filtering for network services using daemon-specific access control lists. Rules are evaluated sequentially, and the first match for a host and service is applied. Because they filter by specific service rather than network port, TCP wrappers supplement firewalls rather than replace them.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Configuration File</th>
      <th>Rule Processing Order</th>
      <th>Operational Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/etc/hosts.allow</code></td>
      <td><strong>First Priority:</strong> Evaluated first.</td>
      <td>If a service request matches a rule defined here, access is granted immediately.</td>
    </tr>
    <tr>
      <td><code>/etc/hosts.deny</code></td>
      <td><strong>Second Priority:</strong> Evaluated if no match in <code>hosts.allow</code>.</td>
      <td>If a request matches a rule here, access is denied. If absent in both files, access is granted.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; TCP Wrappers Rule Syntax Examples</strong></h4>
<p class="lead mb-4">Standard configuration entries for restricting or permitting network services by IP, subnet, or domain name:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Configuration File</th>
      <th>Rule Syntax Example</th>
      <th>Rule Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/etc/hosts.allow</code></td>
      <td><code>sshd : 10.129.14.0/24</code></td>
      <td>Allows SSH access specifically from the <code>10.129.14.0/24</code> subnet.</td>
    </tr>
    <tr>
      <td><code>/etc/hosts.allow</code></td>
      <td><code>ftpd : 10.129.14.10</code></td>
      <td>Allows FTP access exclusively from host <code>10.129.14.10</code>.</td>
    </tr>
    <tr>
      <td><code>/etc/hosts.allow</code></td>
      <td><code>telnetd : .inlanefreight.local</code></td>
      <td>Allows Telnet connections from any host within the <code>.inlanefreight.local</code> domain.</td>
    </tr>
    <tr>
      <td><code>/etc/hosts.deny</code></td>
      <td><code>ALL : .inlanefreight.com</code></td>
      <td>Denies access to all wrapped services for hosts under <code>.inlanefreight.com</code>.</td>
    </tr>
    <tr>
      <td><code>/etc/hosts.deny</code></td>
      <td><code>sshd : 10.129.22.22</code></td>
      <td>Denies SSH connections specifically originating from IP <code>10.129.22.22</code>.</td>
    </tr>
    <tr>
      <td><code>/etc/hosts.deny</code></td>
      <td><code>ftpd : 10.129.22.0/24</code></td>
      <td>Blocks FTP connections originating from the IP range <code>10.129.22.0/24</code>.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.21 Firewall Setup {#ch3.21-firewall-setup}

<h4 class="mb-2"><strong>&gt; Linux Netfilter Ecosystem &amp; Firewall Tools</strong></h4>
<p class="lead mb-4">Linux firewalling relies on the kernel Netfilter framework to intercept and filter packet traffic. Various tools provide distinct interfaces and capabilities over Netfilter:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Tool / Solution</th>
      <th>Architecture &amp; Mechanics</th>
      <th>Primary Use Case &amp; Profile</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>iptables</strong></td>
      <td>Legacy command-line tool managing Netfilter kernel hooks using tables, chains, and rules.</td>
      <td>De facto standard historically; flexible, fine-grained rule construction.</td>
    </tr>
    <tr>
      <td><strong>nftables</strong></td>
      <td>Modern kernel replacement for iptables with enhanced performance and simplified syntax.</td>
      <td>Default firewall engine in modern Linux distros; requires syntax migration from iptables.</td>
    </tr>
    <tr>
      <td><strong>UFW (Uncomplicated Firewall)</strong></td>
      <td>Simplified frontend CLI tool built on top of iptables/nftables framework.</td>
      <td>User-friendly firewall management common on Ubuntu/Debian host installations.</td>
    </tr>
    <tr>
      <td><strong>FirewallD</strong></td>
      <td>Dynamic firewall manager utilizing network zones, XML profiles, and runtime rules.</td>
      <td>Enterprise firewall administration common on RHEL/Fedora/CentOS environments.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Core Components of iptables</strong></h4>
<p class="lead mb-4">The iptables engine organizes filtering logic into five distinct structural components:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Component</th>
      <th>Structural Role</th>
      <th>Operational Mechanics</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Tables</strong></td>
      <td>Top-level categorization</td>
      <td>Organizes firewall rules based on processing type (filtering, NAT, packet alteration).</td>
    </tr>
    <tr>
      <td><strong>Chains</strong></td>
      <td>Rule groupings</td>
      <td>Groups ordered rule sets triggered at specific points in the packet processing flow.</td>
    </tr>
    <tr>
      <td><strong>Rules</strong></td>
      <td>Filtering statements</td>
      <td>Defines matching conditions (headers, ports, IPs) and associated actions for matching traffic.</td>
    </tr>
    <tr>
      <td><strong>Matches</strong></td>
      <td>Packet inspection criteria</td>
      <td>Evaluates specific packet flags, source/destination criteria, protocols, or state connections.</td>
    </tr>
    <tr>
      <td><strong>Targets</strong></td>
      <td>Execution actions</td>
      <td>Specifies the action taken when a packet fulfills rule criteria (e.g., ACCEPT, DROP, REJECT).</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; iptables Built-in Tables &amp; Chains</strong></h4>
<p class="lead mb-4">Each iptables table fulfills a dedicated packet processing role and exposes specific built-in chains:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Table Name</th>
      <th>Primary Purpose</th>
      <th>Built-in Chains Included</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>filter</strong></td>
      <td>Default table for standard traffic filtering based on IPs, ports, and protocols.</td>
      <td><code>INPUT</code>, <code>OUTPUT</code>, <code>FORWARD</code></td>
    </tr>
    <tr>
      <td><strong>nat</strong></td>
      <td>Modifies source or destination IP addresses for Network Address Translation.</td>
      <td><code>PREROUTING</code>, <code>POSTROUTING</code>, <code>OUTPUT</code></td>
    </tr>
    <tr>
      <td><strong>mangle</strong></td>
      <td>Alters IP packet header fields (QoS, TTL, TOS flags).</td>
      <td><code>PREROUTING</code>, <code>INPUT</code>, <code>FORWARD</code>, <code>OUTPUT</code>, <code>POSTROUTING</code></td>
    </tr>
    <tr>
      <td><strong>raw</strong></td>
      <td>Configures connection tracking exemptions prior to Netfilter state processing.</td>
      <td><code>PREROUTING</code>, <code>OUTPUT</code></td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; iptables Rule Targets (-j / --jump)</strong></h4>
<p class="lead mb-4">Actions executed when a network packet matches all criteria within an iptables rule:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Target Action</th>
      <th>Behavior &amp; Function</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>ACCEPT</strong></td>
      <td>Permits the packet to pass through the firewall to its intended destination.</td>
    </tr>
    <tr>
      <td><strong>DROP</strong></td>
      <td>Silently discards the packet without notifying the sender.</td>
    </tr>
    <tr>
      <td><strong>REJECT</strong></td>
      <td>Drops the packet and sends an ICMP error message back to the source host.</td>
    </tr>
    <tr>
      <td><strong>LOG</strong></td>
      <td>Writes packet header information to kernel syslog and continues rule evaluation.</td>
    </tr>
    <tr>
      <td><strong>SNAT</strong></td>
      <td>Source NAT; rewrites packet source IP (typically mapping internal hosts to public IPs).</td>
    </tr>
    <tr>
      <td><strong>DNAT</strong></td>
      <td>Destination NAT; rewrites packet destination IP (typically used for port forwarding).</td>
    </tr>
    <tr>
      <td><strong>MASQUERADE</strong></td>
      <td>Dynamic SNAT used when the external outbound IP address is non-static/DHCP.</td>
    </tr>
    <tr>
      <td><strong>REDIRECT</strong></td>
      <td>Redirects matching incoming packets to a local host port.</td>
    </tr>
    <tr>
      <td><strong>MARK</strong></td>
      <td>Sets a Netfilter mark value on packets for custom routing or bandwidth control.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Common Matching Extensions &amp; Command Examples</strong></h4>
<p class="lead mb-4">Matches define packet header criteria for filtering rules. They are invoked directly or via the <code>-m</code> match module:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Match Option</th>
      <th>Description / Filter Criteria</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>-p</code>, <code>--protocol</code></td>
      <td>Matches transport protocol (e.g., <code>tcp</code>, <code>udp</code>, <code>icmp</code>).</td>
    </tr>
    <tr>
      <td><code>-s</code>, <code>--source</code> / <code>-d</code>, <code>--destination</code></td>
      <td>Matches source or destination IP addresses or subnets.</td>
    </tr>
    <tr>
      <td><code>--sport</code> / <code>--dport</code></td>
      <td>Matches source or destination port numbers (used alongside <code>-p tcp</code> or <code>-p udp</code>).</td>
    </tr>
    <tr>
      <td><code>-m state</code> / <code>-m conntrack</code></td>
      <td>Evaluates state tracking (e.g., <code>NEW</code>, <code>ESTABLISHED</code>, <code>RELATED</code>).</td>
    </tr>
    <tr>
      <td><code>-m multiport</code></td>
      <td>Matches comma-separated lists or ranges of ports in a single rule.</td>
    </tr>
    <tr>
      <td><code>-m iprange</code></td>
      <td>Matches packets originating from or destined to an explicit IP address range.</td>
    </tr>
    <tr>
      <td><code>-m string</code> / <code>-m limit</code> / <code>-m mac</code></td>
      <td>Matches payload byte strings, rate-limiting thresholds, or source hardware MAC addresses.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Practical Syntax Commands</strong></h4>
<p class="lead mb-4">Core iptables commands for accepting SSH and HTTP traffic:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Objective</th>
      <th>iptables Command Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Allow SSH (Port 22)</strong></td>
      <td><code>sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT</code></td>
    </tr>
    <tr>
      <td><strong>Allow HTTP (Port 80)</strong></td>
      <td><code>sudo iptables -A INPUT -p tcp -m tcp --dport 80 -j ACCEPT</code></td>
    </tr>
  </tbody>
</table>

<br />

### 3.22 System Logs and Monitoring {#ch3.22-system-logs-and-monitoring}

<h4 class="mb-2"><strong>&gt; Linux Log File Categories &amp; Security Utility</strong></h4>
<p class="lead mb-4">System logs record kernel operations, service activities, authentication events, and security detections. They serve as primary telemetry for troubleshooting and security auditing.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Log Category</th>
      <th>Default Log Path</th>
      <th>Monitored Telemetry &amp; Penetration Testing Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Kernel Logs</strong></td>
      <td><code>/var/log/kern.log</code></td>
      <td>Kernel events, hardware driver exceptions, system calls, and resource crashes. Useful for identifying outdated drivers and DoS vectors.</td>
    </tr>
    <tr>
      <td><strong>System Logs</strong></td>
      <td><code>/var/log/syslog</code></td>
      <td>System-level events, scheduled CRON execution, service start/stop triggers, and reboots. Tracks overall system behavior and service availability.</td>
    </tr>
    <tr>
      <td><strong>Authentication Logs</strong></td>
      <td><code>/var/log/auth.log</code> (Debian/Ubuntu)<br><code>/var/log/secure</code> (RHEL/CentOS)</td>
      <td>User authentication attempts, public key logins, sudo command executions, and PAM sessions. Critical for detecting brute-force attacks and privilege escalation.</td>
    </tr>
    <tr>
      <td><strong>Application Logs</strong></td>
      <td><code>/var/log/&lt;service&gt;/</code></td>
      <td>Service-specific activity, error outputs, web requests, and database transactions (e.g., Apache, Nginx, MySQL, PostgreSQL). Tracks application processing and data manipulation.</td>
    </tr>
    <tr>
      <td><strong>Security Logs</strong></td>
      <td><code>/var/log/fail2ban.log</code><br><code>/var/log/ufw.log</code></td>
      <td>Dedicated security software outputs including firewall packet drops, ban triggers, and IDS alerts. Indicates active host defenses and filtering rules.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Common Service Access Log Locations</strong></h4>
<p class="lead mb-4">Default file paths where standard Linux infrastructure services and daemons record access attempts and operational requests:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Service / Daemon</th>
      <th>Access Log Path</th>
      <th>Logged Activity Profile</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Apache HTTP Server</strong></td>
      <td><code>/var/log/apache2/access.log</code></td>
      <td>Inbound HTTP/HTTPS requests, client IP addresses, user agents, URI paths, and status codes.</td>
    </tr>
    <tr>
      <td><strong>Nginx Web Server</strong></td>
      <td><code>/var/log/nginx/access.log</code></td>
      <td>HTTP connection requests, proxied endpoints, response payloads, and client identifiers.</td>
    </tr>
    <tr>
      <td><strong>OpenSSH Daemon</strong></td>
      <td><code>/var/log/auth.log</code> or <code>/var/log/secure</code></td>
      <td>Remote connection attempts, key-based/password auth results, SSH session opens and disconnects.</td>
    </tr>
    <tr>
      <td><strong>MySQL Server</strong></td>
      <td><code>/var/log/mysql/mysql.log</code></td>
      <td>Database query connections, client sessions, and administrative transactions.</td>
    </tr>
    <tr>
      <td><strong>PostgreSQL Server</strong></td>
      <td><code>/var/log/postgresql/postgresql-version-main.log</code></td>
      <td>Database connection logs, SQL query executions, and authentication events.</td>
    </tr>
    <tr>
      <td><strong>Systemd Journal</strong></td>
      <td><code>/var/log/journal/</code></td>
      <td>Binary system logs managed by <code>systemd-journald</code>, readable via <code>journalctl</code>.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Sample Log Entries Analysis</strong></h4>
<p class="lead mb-4">Representative log records illustrating authentication events, sudo command execution, and custom audit entries:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Log Context</th>
      <th>Log Entry Example</th>
      <th>Security Significance</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Syslog (CRON)</strong></td>
      <td><code>Feb 28 2023 15:00:01 server CRON[2715]: (root) CMD (/usr/local/bin/backup.sh)</code></td>
      <td>Identifies scheduled root tasks that may present privilege escalation vectors if scripts are world-writable.</td>
    </tr>
    <tr>
      <td><strong>Auth (Sudo Execution)</strong></td>
      <td><code>Feb 28 2023 18:15:03 sudo: admin : TTY=pts/1 ; PWD=/home/admin ; USER=root ; COMMAND=/usr/bin/apt-get install netcat-traditional</code></td>
      <td>Tracks elevation of privilege and binary installations executed via <code>sudo</code>.</td>
    </tr>
    <tr>
      <td><strong>Access Log</strong></td>
      <td><code>2023-03-07T10:15:23+00:00 servername privileged.sh: htb-student accessed /root/hidden/api-keys.txt</code></td>
      <td>Records specific file access events and script execution parameters.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Operational Log Management Best Practices</strong></h4>
<p class="lead mb-4">Core administrative and configuration practices for maintaining log integrity and supporting post-engagement analysis:</p>

<ul class="mb-4">
  <li><strong>Proper Log Level Configuration:</strong> Set explicit logging severity levels to capture necessary debug and security events without causing unnecessary disk I/O overhead.</li>
  <li><strong>Log Rotation Management:</strong> Configure <code>logrotate</code> rules to prevent log files from exhausting host disk space while maintaining historical archives.</li>
  <li><strong>Access Control &amp; File Permissions:</strong> Restrict read/write permissions on <code>/var/log/</code> directories to authorized administrators and service accounts to prevent log tampering or deletion.</li>
  <li><strong>Post-Test Security Verification:</strong> Review logs after security testing to evaluate whether simulated attack vectors triggered host alerts, network IDS detections, or defensive bans.</li>
  <li><strong>Command-Line Inspection Utilities:</strong> Utilize CLI tools such as <code>tail -f</code>, <code>grep</code>, <code>sed</code>, and <code>awk</code> to filter and parse log streams efficiently during security reviews.</li>
</ul>

<br />

### 3.23 Solaris {#ch3.23-solaris}

<h4 class="mb-2"><strong>&gt; Solaris Operating System Architecture Overview</strong></h4>
<p class="lead mb-4">Solaris is an enterprise-grade, proprietary Unix operating system developed for mission-critical applications, large data centers, and specialized SPARC/x86 hardware architectures.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Feature Domain</th>
      <th>Solaris Implementation</th>
      <th>Enterprise Functionality</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Source Model</strong></td>
      <td>Proprietary (Closed Source)</td>
      <td>Governed by Oracle Corporation; core source code is protected and non-public.</td>
    </tr>
    <tr>
      <td><strong>Service Management</strong></td>
      <td>Service Management Facility (SMF)</td>
      <td>Advanced service lifecycle management providing automated fault recovery and dependency mapping.</td>
    </tr>
    <tr>
      <td><strong>Virtualization</strong></td>
      <td>Oracle VM Server for SPARC / Zones</td>
      <td>Built-in hypervisor capabilities allowing native, hardware-isolated guest domains on physical servers.</td>
    </tr>
    <tr>
      <td><strong>Package Management</strong></td>
      <td>Image Packaging System (IPS) / SPM</td>
      <td>Network-aware software lifecycle management utilizing tools like <code>pkgadd</code> and <code>pkg</code>.</td>
    </tr>
    <tr>
      <td><strong>Access Control</strong></td>
      <td>Role-Based Access Control (RBAC)</td>
      <td>Fine-grained permission allocation for specific tasks without requiring full root delegation.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Solaris Filesystem Hierarchy</strong></h4>
<p class="lead mb-4">Standard directory layout across Solaris system installations:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Directory Path</th>
      <th>System Function &amp; Stored Content</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/</code></td>
      <td>Root directory containing all system subdirectories and mounts.</td>
    </tr>
    <tr>
      <td><code>/bin</code></td>
      <td>Essential system binaries required for system booting and base recovery.</td>
    </tr>
    <tr>
      <td><code>/boot</code></td>
      <td>Bootloader files, system kernel images, and boot configuration data.</td>
    </tr>
    <tr>
      <td><code>/dev</code></td>
      <td>Logical and physical device nodes representing attached system hardware.</td>
    </tr>
    <tr>
      <td><code>/etc</code></td>
      <td>Host-specific system configuration files, startup scripts, and local auth databases.</td>
    </tr>
    <tr>
      <td><code>/home</code></td>
      <td>Default mount point for local user home directories.</td>
    </tr>
    <tr>
      <td><code>/kernel</code></td>
      <td>Solaris kernel modules, drivers, and architecture-specific kernel binaries.</td>
    </tr>
    <tr>
      <td><code>/lib</code></td>
      <td>Shared system libraries essential for binaries in <code>/bin</code> and <code>/sbin</code>.</td>
    </tr>
    <tr>
      <td><code>/lost+found</code></td>
      <td>Directory reserved for file recovery during filesystem consistency checks (<code>fsck</code>).</td>
    </tr>
    <tr>
      <td><code>/mnt</code></td>
      <td>Temporary mount point for external filesystems.</td>
    </tr>
    <tr>
      <td><code>/opt</code></td>
      <td>Installation path for optional third-party application software packages.</td>
    </tr>
    <tr>
      <td><code>/proc</code></td>
      <td>Virtual filesystem reflecting process states and active kernel structures.</td>
    </tr>
    <tr>
      <td><code>/sbin</code></td>
      <td>System administration binaries required for system boot and restoration.</td>
    </tr>
    <tr>
      <td><code>/tmp</code></td>
      <td>Volatile temporary storage cleared on system reboot.</td>
    </tr>
    <tr>
      <td><code>/usr</code></td>
      <td>Read-only system resources, secondary binaries, documentation, and shared libraries.</td>
    </tr>
    <tr>
      <td><code>/var</code></td>
      <td>Variable operational data including log files, mail queues, and print spools.</td>
    </tr>
  </tbody>
</table>

<h4 class="mb-2"><strong>&gt; Solaris vs Linux (Ubuntu) Command &amp; Feature Comparison</strong></h4>
<p class="lead mb-4">Key command-line utilities and syntax variations between Solaris and Debian-based Linux environments:</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Operational Task</th>
      <th>Linux (Ubuntu / Debian)</th>
      <th>Solaris (SunOS)</th>
      <th>Key Structural Differences</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>System Information</strong></td>
      <td><code>uname -a</code></td>
      <td><code>showrev -a</code></td>
      <td><code>showrev</code> provides detailed patch revision levels, architecture (e.g., SPARC), and vendor provider details.</td>
    </tr>
    <tr>
      <td><strong>Package Installation</strong></td>
      <td><code>sudo apt-get install &lt;pkg&gt;</code></td>
      <td><code>pkgadd -d &lt;pkg_file&gt;</code></td>
      <td>Linux uses APT/DPKG repos; Solaris traditional package administration relies on SPM/IPS package files.</td>
    </tr>
    <tr>
      <td><strong>SUID Permissions Find</strong></td>
      <td><code>find / -perm 4000</code></td>
      <td><code>find / -perm -4000</code></td>
      <td>Solaris requires explicit minus prefix (<code>-4000</code>) for bitmask matching logic.</td>
    </tr>
    <tr>
      <td><strong>NFS Share Export</strong></td>
      <td>Configured via <code>/etc/exports</code></td>
      <td><code>share -F nfs -o rw /export/home</code></td>
      <td>Solaris manages runtime NFS exports via <code>share</code> command and records persistent shares in <code>/etc/dfs/dfstab</code>.</td>
    </tr>
    <tr>
      <td><strong>NFS Share Mount</strong></td>
      <td><code>mount -t nfs &lt;host&gt;:&lt;path&gt; &lt;target&gt;</code></td>
      <td><code>mount -F nfs 10.129.15.122:/nfs_share /mnt/local</code></td>
      <td>Solaris uses <code>-F nfs</code> flag instead of the standard Linux <code>-t nfs</code> filesystem specifier.</td>
    </tr>
    <tr>
      <td><strong>Process File Mapping</strong></td>
      <td><code>sudo lsof -c apache2</code></td>
      <td><code>pfiles `pgrep httpd`</code></td>
      <td>Solaris utilizes native process tools (<code>pfiles</code>) to inspect open file descriptors and active sockets.</td>
    </tr>
    <tr>
      <td><strong>System Call Tracing</strong></td>
      <td><code>sudo strace -p `pgrep apache2`</code></td>
      <td><code>truss -p `pgrep httpd`</code> or <code>truss ls</code></td>
      <td><code>truss</code> traces system calls, process signals, and child processes natively in Solaris.</td>
    </tr>
  </tbody>
</table>

<br />

### 3.24 Shortcuts {#ch3.24-shortcuts}

<h4 class="mb-2"><strong>&gt; Linux Terminal Keyboard Shortcuts</strong></h4>
<p class="lead mb-4">A reference guide for command-line shortcuts designed to accelerate navigation, line editing, process management, and terminal session control.</p>

<table class="default-table">
  <thead>
    <tr>
      <th>Shortcut</th>
      <th>Functional Domain</th>
      <th>Operational Behavior &amp; Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>[TAB]</code></td>
      <td>Auto-Complete</td>
      <td>Triggers context-aware auto-completion for commands, file paths, directories, and options based on current input.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + A</code></td>
      <td>Cursor Movement</td>
      <td>Moves the cursor to the beginning of the current command line.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + E</code></td>
      <td>Cursor Movement</td>
      <td>Moves the cursor to the end of the current command line.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + [←] / [→]</code></td>
      <td>Cursor Movement</td>
      <td>Jumps the cursor backward or forward to the beginning of the previous/next word.</td>
    </tr>
    <tr>
      <td><code>[ALT] + B / F</code></td>
      <td>Cursor Movement</td>
      <td>Jumps the cursor backward (<code>B</code>) or forward (<code>F</code>) by one word.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + U</code></td>
      <td>Line Erasing</td>
      <td>Erases all text from the current cursor position backward to the beginning of the line.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + K</code></td>
      <td>Line Erasing</td>
      <td>Erases all text from the current cursor position forward to the end of the line.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + W</code></td>
      <td>Line Erasing</td>
      <td>Erases the single word immediately preceding the cursor position.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + Y</code></td>
      <td>Paste Text</td>
      <td>Pastes (yanks) the most recently erased text or word back to the cursor location.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + C</code></td>
      <td>Process Control</td>
      <td>Sends the <code>SIGINT</code> signal to interrupt and terminate the actively running foreground process.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + Z</code></td>
      <td>Process Control</td>
      <td>Sends the <code>SIGTSTP</code> signal to suspend the active foreground task and move it to the background.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + D</code></td>
      <td>Session Control</td>
      <td>Sends an End-of-File (EOF) marker to close <code>STDIN</code> or exit the current shell session.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + L</code></td>
      <td>Display Control</td>
      <td>Clears the terminal display screen (equivalent to executing the <code>clear</code> command).</td>
    </tr>
    <tr>
      <td><code>[CTRL] + R</code></td>
      <td>History Navigation</td>
      <td>Initiates a reverse interactive search through previously executed shell command history.</td>
    </tr>
    <tr>
      <td><code>[↑] / [↓]</code></td>
      <td>History Navigation</td>
      <td>Cycles backward (up) or forward (down) through the command history sequentially.</td>
    </tr>
    <tr>
      <td><code>[ALT] + [TAB]</code></td>
      <td>Desktop Environment</td>
      <td>Switches focus between active graphical window applications.</td>
    </tr>
    <tr>
      <td><code>[CTRL] + [+]</code></td>
      <td>Display Zoom</td>
      <td>Increases the terminal window text font size (Zoom In).</td>
    </tr>
    <tr>
      <td><code>[CTRL] + [-]</code></td>
      <td>Display Zoom</td>
      <td>Decreases the terminal window text font size (Zoom Out).</td>
    </tr>
  </tbody>
</table>

<br />


## 4. Introduction to Bash Scripting {#ch4}

<br />




<br />


## 5. Windows Fundamentals {#ch5}



<br />



## 6. Introduction to Windows Command Line {#ch6}


<br />


## 7. Pentest in a Nutshell {#ch7}

<br />

## 8. Network Enumeration with Nmap {#ch8}

<br />

## 9. Footprinting {#ch9}

<br />

## 10. Hacking WordPress {#ch10}

<br />

## 11. Using the Metasploit Framework {#ch11}

<br />

## 12. Intro to Network Traffic Analysis {#ch12}

<br />

## 13. Incident Handling Process {#ch13}

<br />

## 14. Windows Event Logs & Finding Evil {#ch14}

<br />

## 15. Security Monitoring & SIEM Fundamentals {#ch15}

<br />

## 16. Introduction to Threat Hunting & Hunting With Elastic {#ch16}



<br />

<p class="mb-4">Reference:</p>
<li><a href="https://academy.hackthebox.com/app/paths/419/details" target="blank" referer="noopener noreferer">https://academy.hackthebox.com/app/paths/419/details</a></li>

<br />


<hr />
<section class="text-center" style="margin-top:1.5rem; margin-bottom:1.5rem;">
<p class="mb-1" style="font-style:italic; font-size:1.125rem;">See you in the next Hack.</p>
<p class="mb-0" style="font-weight:700;">@aaronamran</p>
<p class="text-muted small mt-1">August 2026</p>
</section>
<br />
<div class="writeup-nav">
</div>

</div>


