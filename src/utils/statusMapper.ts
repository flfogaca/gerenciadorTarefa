export const ProjectStatus = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED'
} as const;

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const;

export const projectStatusToLabel: Record<string, string> = {
  [ProjectStatus.PLANNING]: 'Planejamento',
  [ProjectStatus.ACTIVE]: 'Em Andamento',
  [ProjectStatus.ON_HOLD]: 'Pausado',
  [ProjectStatus.COMPLETED]: 'Concluído',
  [ProjectStatus.CANCELLED]: 'Cancelado',
  'planning': 'Planejamento',
  'active': 'Em Andamento',
  'paused': 'Pausado',
  'completed': 'Concluído',
  'cancelled': 'Cancelado'
};

export const taskStatusToLabel: Record<string, string> = {
  [TaskStatus.TODO]: 'Pendente',
  [TaskStatus.IN_PROGRESS]: 'Em Andamento',
  [TaskStatus.REVIEW]: 'Em Revisão',
  [TaskStatus.DONE]: 'Concluído',
  [TaskStatus.CANCELLED]: 'Cancelado',
  'TODO': 'Pendente',
  'IN_PROGRESS': 'Em Andamento',
  'REVIEW': 'Em Revisão',
  'DONE': 'Concluído',
  'CANCELLED': 'Cancelado',
  'Pendente': 'Pendente',
  'Em andamento': 'Em Andamento',
  'Concluído': 'Concluído',
  'Pausado': 'Pausado',
  'Cancelado': 'Cancelado'
};

export const taskPriorityToLabel: Record<string, string> = {
  [TaskPriority.LOW]: 'Baixa',
  [TaskPriority.MEDIUM]: 'Média',
  [TaskPriority.HIGH]: 'Alta',
  [TaskPriority.URGENT]: 'Urgente',
  'LOW': 'Baixa',
  'MEDIUM': 'Média',
  'HIGH': 'Alta',
  'URGENT': 'Urgente',
  'Baixa': 'Baixa',
  'Média': 'Média',
  'Alta': 'Alta',
  'Urgente': 'Urgente'
};

export const labelToProjectStatus = (label: string): string => {
  const map: Record<string, string> = {
    'Planejamento': ProjectStatus.PLANNING,
    'Em Andamento': ProjectStatus.ACTIVE,
    'Pausado': ProjectStatus.ON_HOLD,
    'Concluído': ProjectStatus.COMPLETED,
    'Cancelado': ProjectStatus.CANCELLED,
    'planning': ProjectStatus.PLANNING,
    'active': ProjectStatus.ACTIVE,
    'paused': ProjectStatus.ON_HOLD,
    'completed': ProjectStatus.COMPLETED,
    'cancelled': ProjectStatus.CANCELLED
  };
  return map[label] || label.toUpperCase();
};

export const labelToTaskStatus = (label: string): string => {
  const map: Record<string, string> = {
    'Pendente': TaskStatus.TODO,
    'Em Andamento': TaskStatus.IN_PROGRESS,
    'Em andamento': TaskStatus.IN_PROGRESS,
    'Em Revisão': TaskStatus.REVIEW,
    'Concluído': TaskStatus.DONE,
    'Cancelado': TaskStatus.CANCELLED,
    'Pausado': TaskStatus.CANCELLED
  };
  return map[label] || label.toUpperCase();
};

export const labelToTaskPriority = (label: string): string => {
  const map: Record<string, string> = {
    'Baixa': TaskPriority.LOW,
    'Média': TaskPriority.MEDIUM,
    'Alta': TaskPriority.HIGH,
    'Urgente': TaskPriority.URGENT
  };
  return map[label] || label.toUpperCase();
};



