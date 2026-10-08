export default function PostTopics({ topics = [] }) {
  if (!topics.length) return null;

  return (
    <ul aria-label="Topics" className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-5 text-muted">
      {topics.map((topic, index) => (
        <li key={topic} className="flex items-center gap-3">
          {index > 0 && <span aria-hidden="true">·</span>}
          {topic}
        </li>
      ))}
    </ul>
  );
}
