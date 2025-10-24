import React, { useState, useEffect } from 'react';
import { Quest, QuestAnswer, MultipleChoiceAnswer, MultipleChoiceQuestion } from '../../src/types';
import { Plus, Trash2, Save } from 'lucide-react';

// Form Component Styling
const FormRow: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-2 md:gap-4 items-start mb-4">{children}</div>;
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => <label className="font-semibold text-on-surface-variant text-sm md:text-right pt-2.5">{children}</label>;
const FormField: React.FC<{ children: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const inputBaseClasses = "neu-inset-input w-full";
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className={inputBaseClasses} />;
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className={inputBaseClasses} rows={3} />;
const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className={`${inputBaseClasses} neu-select`}>{props.children}</select>;

type QuestType = 'submission' | 'identity' | 'mcq';

interface QuestFormProps {
    questToEdit: Partial<Quest>;
    questType: QuestType;
    onSave: (quest: Partial<Quest>) => void;
    onClose: () => void;
}

const QuestForm: React.FC<QuestFormProps> = ({ questToEdit, questType, onSave, onClose }) => {
    
    // Shared state
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState(Date.now());
    const [endTime, setEndTime] = useState(Date.now() + 7 * 86400000);
    
    // Submission-specific
    const [category, setCategory] = useState<'Gaming' | 'Meme' | 'Art' | 'Identity'>('Gaming');
    const [pointsForSubmission, setPointsForSubmission] = useState(50);
    const [pointsForWinning, setPointsForWinning] = useState(500);
    const [maxSubmissionsPerUser, setMaxSubmissionsPerUser] = useState(1);

    // Identity and MCQ specific state
    const [prompt, setPrompt] = useState('');
    const [mcqOptions, setMcqOptions] = useState<string[]>(['', '']);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);

    useEffect(() => {
        if (questToEdit.id) { // Editing existing quest
            let currentTitle = questToEdit.title || '';
            
            if (questType === 'identity' && questToEdit.identityQuestion) {
                currentTitle = questToEdit.identityQuestion.title;
                setPrompt(questToEdit.identityQuestion.prompt);
            }
            if (questType === 'mcq' && questToEdit.multipleChoiceQuestion) {
                currentTitle = questToEdit.multipleChoiceQuestion.title;
                setPrompt(questToEdit.multipleChoiceQuestion.prompt);
                setMcqOptions(questToEdit.multipleChoiceQuestion.options);
                setCorrectAnswerIndex(questToEdit.multipleChoiceQuestion.correctAnswerIndex);
            }
            
            setTitle(currentTitle);
            setCategory(questToEdit.category || 'Gaming');
            setStartTime(questToEdit.startTime || Date.now());
            setEndTime(questToEdit.endTime || Date.now());
            setPointsForSubmission(questToEdit.pointsForSubmission || 50);
            setPointsForWinning(questToEdit.pointsForWinning || 500);
            setMaxSubmissionsPerUser(questToEdit.maxSubmissionsPerUser || 1);
        }
    }, [questToEdit, questType]);

    const handleMcqOptionChange = (index: number, value: string) => {
        const newOptions = [...mcqOptions];
        newOptions[index] = value;
        setMcqOptions(newOptions);
    };
    const addMcqOption = () => setMcqOptions([...mcqOptions, '']);
    const removeMcqOption = (index: number) => {
        setMcqOptions(mcqOptions.filter((_, i) => i !== index));
        if (correctAnswerIndex === index) setCorrectAnswerIndex(null);
    };

    const handleSubmit = () => {
        let questPayload: Partial<Quest> = {
            id: questToEdit.id,
            title,
            startTime,
            endTime,
        };
    
        if (questType === 'submission') {
            questPayload = {
                ...questPayload,
                category,
                pointsForSubmission,
                pointsForWinning,
                maxSubmissionsPerUser,
            };
        } else if (questType === 'identity') {
            questPayload = {
                ...questPayload,
                category: 'Identity',
                identityQuestion: {
                    ...(questToEdit.identityQuestion || { answers: [] }),
                    title: title,
                    prompt: prompt,
                },
            };
        } else if (questType === 'mcq') {
            questPayload = {
                ...questPayload,
                category,
                multipleChoiceQuestion: {
                    ...(questToEdit.multipleChoiceQuestion || { options: [], correctAnswerIndex: 0, answers: [] }),
                    title: title,
                    prompt: prompt,
                    options: mcqOptions,
                    correctAnswerIndex: correctAnswerIndex ?? 0,
                },
            };
        }
    
        onSave(questPayload);
    };

    const toDateTimeLocal = (timestamp: number) => new Date(timestamp - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    return (
        <form onSubmit={e => e.preventDefault()}>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                <FormRow><FormLabel>Title</FormLabel><FormField><FormInput value={title} onChange={e => setTitle(e.target.value)} /></FormField></FormRow>
                
                {questType === 'identity' ? (
                    <input type="hidden" value="Identity" />
                ) : (
                    <FormRow><FormLabel>Category</FormLabel><FormField><FormSelect value={category} onChange={e => setCategory(e.target.value as any)}>
                        <option>Gaming</option><option>Meme</option><option>Art</option>
                    </FormSelect></FormField></FormRow>
                )}

                {(questType === 'identity' || questType === 'mcq') && (
                     <FormRow><FormLabel>Prompt</FormLabel><FormField><FormTextArea value={prompt} onChange={e => setPrompt(e.target.value)} /></FormField></FormRow>
                )}
                
                {questType === 'mcq' && (
                    <FormRow>
                        <FormLabel>Options</FormLabel>
                        <FormField>
                            <div className="space-y-2">
                                {mcqOptions.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input type="radio" name="correctAnswer" checked={correctAnswerIndex === i} onChange={() => setCorrectAnswerIndex(i)} className="w-5 h-5" />
                                        <FormInput value={opt} onChange={e => handleMcqOptionChange(i, e.target.value)} />
                                        <button type="button" onClick={() => removeMcqOption(i)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addMcqOption} className="neu-button text-sm px-3 py-1 mt-2 flex items-center gap-1"><Plus size={14} /> Add Option</button>
                            </div>
                        </FormField>
                    </FormRow>
                )}
                
                <FormRow><FormLabel>Start Time</FormLabel><FormField><FormInput type="datetime-local" value={toDateTimeLocal(startTime)} onChange={e => setStartTime(new Date(e.target.value).getTime())} /></FormField></FormRow>
                <FormRow><FormLabel>End Time</FormLabel><FormField><FormInput type="datetime-local" value={toDateTimeLocal(endTime)} onChange={e => setEndTime(new Date(e.target.value).getTime())} /></FormField></FormRow>
                
                {questType === 'submission' && (
                    <>
                         <FormRow><FormLabel>Points (Submission)</FormLabel><FormField><FormInput type="number" value={pointsForSubmission} onChange={e => setPointsForSubmission(Number(e.target.value))} /></FormField></FormRow>
                         <FormRow><FormLabel>Points (Winning)</FormLabel><FormField><FormInput type="number" value={pointsForWinning} onChange={e => setPointsForWinning(Number(e.target.value))} /></FormField></FormRow>
                         <FormRow><FormLabel>Max Submissions</FormLabel><FormField><FormInput type="number" value={maxSubmissionsPerUser} onChange={e => setMaxSubmissionsPerUser(Number(e.target.value))} /></FormField></FormRow>
                    </>
                )}

            </div>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-border/20">
                <button type="button" onClick={onClose} className="neu-button px-4 py-2 font-bold">Cancel</button>
                <button type="button" onClick={handleSubmit} className="neu-button active px-4 py-2 font-bold flex items-center gap-2"><Save size={16} /> Save</button>
            </div>
        </form>
    );
};

export default QuestForm;