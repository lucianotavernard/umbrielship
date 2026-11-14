const MESSAGES: Record<string, string> = {
  'Customer already exists': 'Já existe um cliente com este e-mail.',
  'Customer in use': 'Este cliente possui embarcações e não pode ser excluído.',
  'Customer not found': 'Cliente não encontrado.',
  'Vessel already exists': 'Já existe uma embarcação com este número IMO.',
  'Vessel not found': 'Embarcação não encontrada.',
  'Work order not found': 'Ordem de serviço não encontrada.',
  'Work order service not found': 'Serviço não encontrado.',
  'Work order service image not found': 'Foto não encontrada.',
  'Inspection template not found': 'Modelo de inspeção não encontrado.',
  'Inspection assignment not found': 'Atribuição não encontrada.',
  'Inspection assignment has inspections': 'Esta atribuição tem inspeções e não pode ser removida.',
  'Inspection not found': 'Inspeção não encontrada.',
  'Answers do not match the questions': 'As respostas não correspondem às perguntas.',
  'Work order is not in progress': 'A ordem de serviço não está em andamento.',
  'Work order service is not in progress': 'O serviço não está em andamento.',
  'Work order has inspections': 'Esta ordem de serviço tem inspeções e não pode ser excluída.',
  'Work order service has inspections': 'Este serviço tem inspeções e não pode ser excluído.',
  'Organization already exists': 'Já existe uma organização com este nome ou e-mail.',
  'Organization not found': 'Organização não encontrada.',
  'User already exists': 'Já existe um usuário com este e-mail.',
  'User not found': 'Usuário não encontrado.',
  'Invitation already accepted': 'Este convite já foi aceito.',
  'Invitation already pending': 'Este usuário já tem um convite pendente para a organização.',
  'Invitation delivery already queued': 'O envio deste convite já está na fila.',
  'Invitation not found': 'Convite não encontrado.',
  'User already belongs to this organization': 'Este usuário já faz parte da organização.',
  'The internal organization does not accept invitations': 'A organização interna não recebe convites.',
  'Wrong credentials': 'E-mail ou senha incorretos.',
  'Validation failed': 'Verifique os campos preenchidos.',
  'File is required': 'Selecione um arquivo.',
};

export function apiErrorMessage(
  response: { error?: unknown } | null | undefined,
  fallback: string,
): string {
  const error = response?.error;
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message?: unknown }).message
      : undefined;

  return typeof message === 'string' ? (MESSAGES[message] ?? fallback) : fallback;
}
