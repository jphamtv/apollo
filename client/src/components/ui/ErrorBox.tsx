import styles from './ErrorBox.module.css';

interface ErrorBoxProps {
  errors: string[] | string;
}

export default function ErrorBox({ errors }: ErrorBoxProps) {
  const errorArray = Array.isArray(errors) ? errors : [errors];

  if (errorArray.length === 0) return null;

  return (
    <div className={styles.errorBox}>
      {errorArray.length === 1 ? (
        <p>{errorArray[0]}</p>
      ) : (
        <ul>
          {errorArray.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
