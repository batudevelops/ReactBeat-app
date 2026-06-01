export interface GameModeScreenProps {
  level: number;
  /** Stub: gerçek oyun motoru Faz 5-6'da bağlanacak. */
  onFinish: (result: { score: number; isNewRecord: boolean }) => void;
}
