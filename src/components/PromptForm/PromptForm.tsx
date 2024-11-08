import React, { useState, useEffect } from 'react';
import { AdjustmentsHorizontalIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AdvancedControls } from './AdvancedControls';
import { createPrompt } from '@/api/prompts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePromptFormStore } from '@/store/promptFormStore';
import { useImageUpload } from '@/hooks/useImageUpload';
import usePaste from '@/hooks/usePaste';
import { SendIcon } from 'lucide-react';
import { useStore } from '@/store/promptStore';
import { useAPrompt } from '@/hooks/useAPrompt';
import { AxiosError } from 'axios';

interface PromptFormProps {
    tabDisplay?: boolean;
}

const PromptForm: React.FC<PromptFormProps> = () => {
    const [showAdvancedControls, setShowAdvancedControls] = useState(false);
    const [showImageControls, setShowImageControls] = useState(false);

    const { handleUsePrompt } = useAPrompt();

    // get all the states from the store
    const { promptText, setPromptText, width, setWidth, height, setHeight,
        controlNet, setControlNet, colorGrading, setColorGrading,
        superResolution, setSuperResolution, hiresFix, setHiresFix, inpaintFaces, setInpaintFaces,
        faceCorrect, setFaceCorrect, faceSwap, setFaceSwap, denoisingStrength, setDenoisingStrength,
        conditioningScale, setConditioningScale, numImages, setNumImages, isLoading, setIsLoading, setError
    } = usePromptFormStore();

    const { userPrompts, refreshUserPrompts } = useStore();

    const { image, urlImage, uploadError, getRootProps, getInputProps, clearImage } = useImageUpload({});

    usePaste((pasteText, pasteObject) => {
        if (pasteText) setPromptText(pasteText);
        console.log(pasteObject);
        if (pasteObject) {
            setControlNet(pasteObject.controlnet || controlNet);
            setColorGrading(pasteObject.color_grading || colorGrading);
            setSuperResolution(pasteObject.super_resolution === 'true');
            setHiresFix(pasteObject.hires_fix === 'true');
            setInpaintFaces(pasteObject.inpaint_faces === 'true');
            setFaceCorrect(pasteObject.face_correct === 'true');
            setFaceSwap(pasteObject.face_swap === 'true');
            setDenoisingStrength(parseFloat(pasteObject.denoising_strength) || denoisingStrength);
            setConditioningScale(parseFloat(pasteObject.controlnet_conditioning_scale) || conditioningScale);
            setNumImages(parseInt(pasteObject.num_images) || numImages);
            setWidth(parseInt(pasteObject.w) || width);
            setHeight(parseInt(pasteObject.h) || height);
        }
    });

    const handleSubmit = async () => {
        if (!promptText.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('prompt[text]', promptText);
            formData.append('prompt[tune_id]', "1504944");
            if (image) formData.append('prompt[input_image]', image);
            if (urlImage) formData.append('prompt[input_image_url]', urlImage);
            if (controlNet) formData.append('prompt[control_net]', controlNet);
            if (colorGrading) formData.append('prompt[color_grading]', colorGrading);
            if (superResolution !== undefined) formData.append('prompt[super_resolution]', `${superResolution}`);
            if (hiresFix !== undefined) formData.append('prompt[hires_fix]', `${hiresFix}`);
            if (inpaintFaces !== undefined) formData.append('prompt[inpaint_faces]', `${inpaintFaces}`);
            if (faceCorrect !== undefined) formData.append('prompt[face_correct]', `${faceCorrect}`);
            if (faceSwap !== undefined) formData.append('prompt[face_swap]', `${faceSwap}`);
            if (denoisingStrength !== undefined) formData.append('prompt[denoising_strength]', `${denoisingStrength}`);
            if (conditioningScale !== undefined) formData.append('prompt[conditioning_scale]', `${conditioningScale}`);
            if (numImages !== undefined) formData.append('prompt[num_images]', `${numImages}`);
            if (width !== undefined) formData.append('prompt[w]', `${width}`);
            if (height !== undefined) formData.append('prompt[h]', `${height}`);
            formData.append('prompt[backend_version]', '0');

            await createPrompt(formData);
            toast.success('Prompt created successfully!');
            refreshUserPrompts();
            setShowImageControls(false);
            setShowAdvancedControls(false);
        } catch (error: AxiosError | any) {
            console.error(error.response?.data);
            if (error.response?.data) {
                setError(error.response.data);
            } else {
                toast.error('Error creating prompt');
            }
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !isLoading && promptText.trim()) {
                e.preventDefault();
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [promptText, isLoading, handleSubmit]);

    useEffect(() => {
        console.log(userPrompts[0]);
        if (userPrompts.length > 0) {
            const prompt = userPrompts[0];
            handleUsePrompt(prompt);
        }
    }, [userPrompts]);

    return (
        <div className={`sticky top-0 z-10 w-full bg-gradient-to-b from-[#fafbfc] pb-4 md:pb-6`}>
            <div className="px-0 pt-6 md:px-6 max-w-7xl mx-auto">
                <Card className="w-full">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row items-stretch">
                            <div className="flex-1">

                                <div className="flex items-center h-auto min-h-12">
                                    <div className="flex gap-2 mx-1">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon"
                                                        onClick={() => { setShowAdvancedControls(false); setShowImageControls(!showImageControls); }}
                                                        className="h-8 w-8">
                                                        <PhotoIcon className="h-5 w-5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent sideOffset={4}>Upload images</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </div>

                                    <Textarea placeholder="Write a prompt..." className="resize-none text-wrap flex-1"
                                        value={`${promptText}`}
                                        onChange={(e) => setPromptText(e.target.value)}
                                        aria-label="Prompt text"
                                        rows={1}
                                        style={{ overflow: 'hidden' }}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto';
                                            target.style.height = `${target.scrollHeight}px`;
                                        }}
                                        autoFocus />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon"
                                                    onClick={() => { setShowImageControls(false); setShowAdvancedControls(!showAdvancedControls); }}
                                                    className="h-8 w-8 mr-0 md:mr-1">
                                                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent sideOffset={4}>Advanced settings</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <Button variant={'ghost'} onClick={handleSubmit} disabled={isLoading} className="h-full pl-1 md:hidden">
                                        <span className="inline"><SendIcon className="w-4 h-4" /></span>
                                    </Button>
                                </div>

                                {showImageControls && <div className='flex m-2'>
                                    <div {...getRootProps()}
                                        className="border-2 border-dashed p-1 rounded-lg cursor-pointer transition-all duration-200 w-24 h-24 flex items-center justify-center">
                                        <input {...getInputProps()} />
                                        {image || urlImage ? (
                                            <div className="relative w-full h-full">
                                                <img src={image ? URL.createObjectURL(image) : urlImage!} alt="Uploaded"
                                                    className="object-cover h-full rounded-md" />
                                                <button onClick={clearImage}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                                                    <XMarkIcon className="h-2 w-2" />
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center text-[12px]">Drag, paste, or click to upload image</p>
                                        )}
                                    </div>

                                    {uploadError && <p className="text-red-600 text-sm mt-2">{uploadError}</p>}

                                </div>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-2 space-y-2">
                    {showAdvancedControls && (<>
                        <div className='fixed inset-0 z-[-1] opacity-100' onClick={
                            () => setShowAdvancedControls(false)
                        }>
                        </div>
                        <Card className="w-full">
                            <CardContent className="p-2 z-20">
                                <AdvancedControls image={image} imageUrl={urlImage} />
                            </CardContent>
                        </Card>
                    </>
                    )}
                </div>
            </div>
            <ToastContainer position="top-right" hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false}
                pauseOnFocusLoss draggable pauseOnHover theme="light" />
        </div>
    );
};

export default PromptForm;