import { Icon } from './Icon';

export function EmptyState({ icon = 'file', title, description, action }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={48} stroke={1.5}/>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
