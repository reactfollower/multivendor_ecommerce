import { MessageCircleQuestion } from "lucide-react";
import { FC } from "react";

interface Question {
    question: string;
    answer: string;
}

interface Props {
    questions: Question[];
}

const ProductQuestions: FC<Props> = ({ questions }) => {
    return (
        <div className="pt-6">
            {/*Title*/}
            <div className="h-12">
                <h2 className="text-main-primary text-2x1 font-bold">
                    Questions & Answers ({ questions.length })
                </h2>
            </div>
            {/* List */}
            <div className="mt-4">
                <div className="space-y-5">
                    {questions.map((question, i)=> (
                        <li key={i} className="relative mb-1">
                            <div className="space-y-2">
                                <div className="flex items-center gap-x-2">
                                    <MessageCircleQuestion className="w-4" />
                                    <p className="text-sm font-bold leading-5">
                                        {question.question}
                                    </p>
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <MessageCircleQuestion className="w-4" />
                                    <p className="text-sm leading-5">
                                        {question.answer}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default ProductQuestions;
