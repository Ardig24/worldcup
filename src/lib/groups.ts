// World Cup 2026 Group Stage Mappings
// Maps team codes to their group letter (A-L)

export const TEAM_GROUPS: Record<string, string> = {
  // Group A
  MEX: 'A', RSA: 'A', KOR: 'A', CZE: 'A',
  // Group B
  CAN: 'B', BIH: 'B', QAT: 'B', SUI: 'B',
  // Group C
  BRA: 'C', MAR: 'C', HAI: 'C', SCO: 'C',
  // Group D
  USA: 'D', PAR: 'D', AUS: 'D', TUR: 'D',
  // Group E
  GER: 'E', CUW: 'E', CIV: 'E', ECU: 'E',
  // Group F
  NED: 'F', JPN: 'F', SWE: 'F', TUN: 'F',
  // Group G
  BEL: 'G', EGY: 'G', IRN: 'G', NZL: 'G',
  // Group H
  ESP: 'H', CPV: 'H', KSA: 'H', URU: 'H',
  // Group I
  FRA: 'I', SEN: 'I', IRQ: 'I', NOR: 'I',
  // Group J
  ARG: 'J', ALG: 'J', AUT: 'J', JOR: 'J',
  // Group K
  POR: 'K', COD: 'K', UZB: 'K', COL: 'K',
  // Group L
  ENG: 'L', CRO: 'L', GHA: 'L', PAN: 'L',
};

export const ALL_GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export function getMatchGroup(homeCode: string, awayCode: string): string | null {
  const homeGroup = TEAM_GROUPS[homeCode];
  const awayGroup = TEAM_GROUPS[awayCode];
  if (homeGroup && homeGroup === awayGroup) return homeGroup;
  return null;
}

export const STAGE_LABELS: Record<string, string> = {
  group: 'Group Stage',
  round_of_32: 'Round of 32',
  round_of_16: 'Round of 16',
  quarterfinal: 'Quarterfinal',
  semifinal: 'Semifinal',
  third_place: 'Third Place',
  final: 'Final',
};
