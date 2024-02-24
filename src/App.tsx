import LZString from "lz-string";
import { InferenceSession, Tensor } from "onnxruntime-web";
import * as ort from 'onnxruntime-web';
import { useContext, useEffect, useState } from "react";
import "./assets/scss/App.scss";
import getFile from "./components/helpers/getFile";
import { handleImageScale } from "./components/helpers/ImageHelper";
import { modelScaleProps } from "./components/helpers/Interface";
import {
  traceCompressedRLeStringToSVG,
  traceOnnxMaskToSVG,
} from "./components/helpers/mask_utils";
import {
  modelData,
  setParmsandQueryModel,
} from "./components/helpers/modelAPI";
import AppContext from "./components/hooks/createContext";
import Stage from "./components/Stage";
import { supabase } from "./lib/initSupabase";


ort.env.debug = false;
// set global logging level
ort.env.logLevel = 'verbose';

// override path of wasm files - for each file
ort.env.wasm.numThreads = 2;
ort.env.wasm.simd = true;
// ort.env.wasm.proxy = true;
ort.env.wasm.wasmPaths = {
  'ort-wasm.wasm': '/ort-wasm.wasm',
  'ort-wasm-simd.wasm': '/ort-wasm-simd.wasm',
  'ort-wasm-threaded.wasm': '/ort-wasm-threaded.wasm',
  'ort-wasm-simd-threaded.wasm': '/ort-wasm-simd-threaded.wasm'
};

// ort.env.webgl.pack = true;

const App = () => {
  const {
    click: [click, setClick],
    clicks: [clicks, setClicks],
    image: [image, setImage],
    prevImage: [prevImage, setPrevImage],
    svg: [svg, setSVG],
    allsvg: [, setAllsvg],
    isModelLoaded: [, setIsModelLoaded],
    isLoading: [, setIsLoading],
    segmentTypes: [, setSegmentTypes],
    maskImg: [, setMaskImg],
    stickerTabBool: [stickerTabBool, setStickerTabBool],
    isHovering: [isHovering, setIsHovering],
    showLoadingModal: [showLoadingModal, setShowLoadingModal],
    eraserText: [eraserText, setEraserText],
    predMask: [predMask, setPredMask],
    predMasks: [predMasks, setPredMasks],
    predMasksHistory: [predMasksHistory, setPredMasksHistory],
    isToolBarUpload: [isToolBarUpload, setIsToolBarUpload],
    drawnLines: [drawnLines, setDrawnLines],
  } = useContext(AppContext)!;
  const [model, setModel] = useState<InferenceSession | null>(null);
  const [tensor, setTensor] = useState<Tensor | null>(null);
  const [hasClicked, setHasClicked] = useState<boolean>(false);
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);

  const downloadImage = async (image: string, mask: string | null) => {
    try {
      const response = await fetch(image);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const file = new File([blob], image, { type: blob.type });
      console.log(file);
      handleSelectedImage(file, mask ? JSON.parse(mask) : undefined);
    } catch (error) {
      console.error('Error fetching and handling the image:', error);
    }
  }

  const downloadWall = async (wall_id: string) => {
    try {
      setLoadingImage(true);
      // const response = await fetch(`https://indoor-climbing-br.vercel.app/api/walls?id=${wall_id}`);
      // get from supabase
      const { data, error } = await supabase.from('walls').select().eq('id', wall_id);
      console.log(data);
      if(error){
        console.log("error", error);
        setLoadingImage(false);
        return;
      }
      // download the image as a file
      await downloadImage(data[0].image, data[0].mask);
      setLoadingImage(false);
    } catch (error) {
      console.log(error);
      setLoadingImage(false);
    }
  }

  // get the params wall_id and auth from the URL
  useEffect(() => {
    setLoadingImage(true);
    const url = new URL(window.location.href);
    const wall_id = url.searchParams.get("wall_id");
    console.log("wall_id", wall_id);
    
    if(wall_id){
      downloadWall(wall_id);
    }
  }, []);

  useEffect(() => {
    const initModel = async () => {
      try {
        // if (process.env.MODEL_DIR === undefined) return;
        const MODEL_DIR = "./interactive_module_quantized_592547_2023_03_19_sam6_long_uncertain.onnx";
        const URL: string = MODEL_DIR;
        // const URL: string = process.env.MODEL_DIR;
        const model = await InferenceSession.create(URL);
        setModel(model);
      } catch (e) {
        // console.log("MODEL:", e);
        console.error(e);
      }
    };
    initModel();
  }, []);

  const runModel = async () => {
    // console.log("Running singleMaskModel");
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return;
      if (stickerTabBool) return;
      // get an array with only the last click
      const lastClick = clicks.slice(-1);
      console.log("lastClick", lastClick);

      const feeds = modelData({
        clicks: lastClick,
        tensor,
        modelScale,
        last_pred_mask: predMask,
      });
      if (feeds === undefined) return;
      const beforeONNX = Date.now();
      console.log("clicks", clicks);
      console.log("predMask", predMask);
      const results = await model.run(feeds);
      const afterONNX = Date.now();
      console.log(`ONNX took ${afterONNX - beforeONNX}ms`);

      console.log("results", results);
      const output = results[model.outputNames[0]];
      if (hasClicked) {
        const beforeSVG = Date.now();
        const pred_mask = results[model.outputNames[1]];
        setPredMask(pred_mask);
        if (!predMasksHistory) {
          setPredMasks([...(predMasks || []), pred_mask]);
        }
        const svgStr = traceOnnxMaskToSVG(
          output.data,
          output.dims[1],
          output.dims[0]
        );
        setSVG([...(svg || []), svgStr]);
        console.log("svgStr", svgStr);
        // setMask(output.data);
        const afterSVG = Date.now();
        console.log(`SVG took ${afterSVG - beforeSVG}ms`);
      }
      
      setClick(null);
      setIsLoading(false);
      setIsModelLoaded((prev) => {
        return { ...prev, boxModel: true };
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    // if num of clicks is less than svg, then remove the last svg
    if (clicks && svg && clicks.length < svg.length) {
      setSVG(svg.slice(0, clicks.length));
    }
  }, [clicks, svg]);

  useEffect(() => {
    const runOnnx = async () => {
      console.log("runModel");
      runModel();
    };
    runOnnx();
  }, [clicks, hasClicked]);


  const handleImage = (img: HTMLImageElement = prevImage!) => {
    // Reset the image, mask and clicks
    setImage(img);
    setMaskImg(null);
    setSVG(null);
    setClick(null);
    setClicks(null);
    setIsModelLoaded({ boxModel: false, allModel: false });
    setHasClicked(false);
    const { height, width, uploadScale } = handleImageScale(img);
    setParmsandQueryModel({
      width,
      height,
      uploadScale,
      imgData: img,
      handleSegModelResults,
      handleAllModelResults,
      imgName: "",
      shouldDownload: false,
      shouldNotFetchAllModel: false,
    });
  };

  const handleSelectedImage = async (
    file: File,
    jsonData?: any
  ) => {
    try {
      console.log("GOT FILE " + file.name);
  
      handleResetState();
      setShowLoadingModal(true);
  
      const img = new Image();
      img.src = URL.createObjectURL(file);
  
      img.onload = async () => {
        setIsToolBarUpload(false);
  
        const { height, width, scale, uploadScale } = handleImageScale(img);
          setModelScale({
            onnxScale: scale / uploadScale,
            maskWidth: width * uploadScale,
            maskHeight: height * uploadScale,
            scale: scale,
            uploadScale: uploadScale,
            width: width,
            height: height,
          });
  
        img.width = Math.round(width * scale);
        img.height = Math.round(height * scale);
        setImage(img);
        setPrevImage(img);
  
        if (jsonData) {
          // Usar jsonData fornecido diretamente
          const tensorDataArray = Object.values(jsonData.data);
          const tensorData = Float32Array.from(tensorDataArray as number[]);
          const tensorDims = jsonData.dims;
          const tensor = new Tensor("float32", tensorData, tensorDims);
          setTensor(tensor);
          setShowLoadingModal(false);
        } else {
          console.log("No JSON data provided");
          // Chamar o modelo para obter os dados necessários
          setParmsandQueryModel({
            width,
            height,
            uploadScale,
            imgData: img,
            handleSegModelResults,
            handleAllModelResults,
            imgName: "",
            shouldDownload: undefined,
            shouldNotFetchAllModel: undefined,
          });
        }
        setIsLoading(false);
      };
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveMaskAndScale = async (mask: string, scale: string) => {
    console.log("handleSaveMaskAndScale");
    console.log(mask);
    console.log(scale);

    const wall_id = new URL(window.location.href).searchParams.get("wall_id")!;

    try {
      const { error: updateError } = await supabase.from('walls').update({
        mask: mask,
        scale: scale,
      }).eq('id', wall_id);
      if (updateError){
        console.log("updateError", updateError);
      }
      console.log("Wall updated successfully");
    } catch (err: any) {
      console.error('Error updating wall', err.message);
    }

    setShowLoadingModal(false);
  }

  const handleSegModelResults = ({ tensor }: { tensor: Tensor }) => {
    console.log("handleSegModelResults tensor")
    console.log(tensor)
    setTensor(tensor);
    handleSaveMaskAndScale(JSON.stringify(tensor), JSON.stringify(modelScale));

    // download tensor result to save in file to use in the future
    // const tensorResult = JSON.stringify(tensor);
    // const blob = new Blob([tensorResult], { type: "application/json" });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement("a");
    // link.href = url;
    // link.download = "tensor.json";
    // link.click();

    setIsLoading(false);
    setShowLoadingModal(false);
  };

  const handleAllModelResults = ({
    allJSON,
    image_height,
  }: {
    allJSON: {
      encodedMask: string;
      bbox: number[];
      score: number;
      point_coord: number[];
      uncertain_iou: number;
      area: number;
    }[];
    image_height: number;
  }) => {
    console.log("handleAllModelResults", allJSON);
    const allMaskSVG = allJSON.map(
      (el: {
        encodedMask: string;
        bbox: number[];
        score: number;
        point_coord: number[];
        uncertain_iou: number;
        area: number;
      }) => {
        const maskenc = LZString.decompressFromEncodedURIComponent(
          el.encodedMask
        );
        const svg = traceCompressedRLeStringToSVG(maskenc, image_height);
        console.log("traceCompressedRLeStringToSVG", svg);
        return { svg: svg, point_coord: el.point_coord };
      }
    );
    console.log("allMaskSVG", allMaskSVG);
    setAllsvg(allMaskSVG);
    setIsModelLoaded((prev) => {
      return { ...prev, allModel: true };
    });
  };

  const handleResetState = () => {
    setMaskImg(null);
    setHasClicked(false);
    setClick(null);
    setClicks(null);
    setSVG(null);
    setAllsvg(null);
    setTensor(null);
    setImage(null);
    setPrevImage(null);
    setPredMask(null);
    setShowLoadingModal(false);
    setIsModelLoaded({ boxModel: false, allModel: false });
    setSegmentTypes("Click");
    setIsLoading(false);
    setIsHovering(null);
    setPredMasks(null);
  };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden items-center justify-center`}>

      {loadingImage && <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginTop: 'auto',
          marginBottom: 'auto',
          height: '100vh',
        }}
      >
        <img src="/assets/loading.gif" alt="Carregando" width="500px" height="500px" />
      </div>}

      <Stage
        scale={modelScale}
        handleResetState={handleResetState}
        handleMagicErase={() => {}}
        handleImage={handleImage}
        hasClicked={hasClicked}
        setHasClicked={setHasClicked}
        handleSelectedImage={handleSelectedImage}
        image={image}
      />
    </div>
  );
};

export default App;
