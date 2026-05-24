import { AudioPlayer } from '../../components/AudioPlayer';
import { QuestionInterface } from '../../interfaces/question.interface';
import './styles.css'

type Props = {
    question?: QuestionInterface;
    quizIdentifier?: string | undefined;
};


export function QuestionMedia({ question, quizIdentifier }: Props) {

    const DATA_URL = import.meta.env.VITE_DATA_URL;

    if (!question) return null;

    return (
        <div className="media-container">
            {question.image && (
                <img
                    className="question-image"
                    src={`${DATA_URL}/images/${quizIdentifier}/${question.image}`}
                    alt={`${DATA_URL}/images/${quizIdentifier}/${question.image}`}
                />
            )}

            {question.audio && (
                <AudioPlayer audioUrl={`${DATA_URL}/audios/${quizIdentifier}/${question.audio}`} font={undefined} />
            )}
        </div>
    );
}