export interface Packet {
  id: string;
  timestamp: number;
  ip: string;
  type: 'normal' | 'malicious';
  size: number;
  path: string;
}

export interface TrafficStats {
  timestamp: string;
  normal: number;
  malicious: number;
  requests: number;
}

export interface BlockedIP {
  ip: string;
  reason: string;
  timestamp: number;
}
