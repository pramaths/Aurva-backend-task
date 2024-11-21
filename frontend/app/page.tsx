'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  FileTextIcon,
  Eye,
  Download
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster";

interface ScanResult {
  _id: string;
  fileName: string;
  sensitiveData: {
    [category: string]: {
      [field: string]: string;
    };
  };
  base64Image?: string;
  fileType?: string;
  timestamp?: Date;
}

export default function SensitiveDataScanner() {
  const { toast } = useToast();
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileTextIcon className="w-6 h-6 text-red-500" />;
      case 'txt':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <ImageIcon className="w-6 h-6 text-green-500" />;
      case 'doc':
      case 'docx':
        return <FileCode className="w-6 h-6 text-blue-700" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    return 'other';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://aurva-backend-task-n979.vercel.app/api/scan-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setScanResults(prev => [response.data, ...prev]);
      toast({
        title: "Success",
        description: "File scanned successfully",
      });
      setFile(null);
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload and scan file",
        variant: "destructive"
      });
    }
  };

  const fetchScanResults = async () => {
    try {
      const response = await axios.get('https://aurva-backend-task-n979.vercel.app/api/scan-results');
      setScanResults(response.data.results);
    } catch (err) {
      console.error('Failed to fetch scan results', err);
      toast({
        title: "Error",
        description: "Failed to fetch scan results",
        variant: "destructive"
      });
    }
  };

  const handleDeleteResult = async (id: string) => {
    try {
      await axios.delete(`https://aurva-backend-task-n979.vercel.app/api/scan-results/${id}`);
      setScanResults(prev => prev.filter(result => result._id !== id));
      toast({
        title: "Success",
        description: "Scan result deleted successfully",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete scan result",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (base64Data: string, fileName: string) => {
    try {
      const fileType = getFileType(fileName);
      let mimeType = 'application/octet-stream';
      
      if (fileType === 'image') {
        mimeType = `image/${fileName.split('.').pop()?.toLowerCase()}`;
      } else if (fileType === 'pdf') {
        mimeType = 'application/pdf';
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchScanResults();
  }, []);

  const renderSensitiveDataDetails = (sensitiveData: ScanResult['sensitiveData']) => {
    return Object.entries(sensitiveData).map(([category, fields]) => (
      <Card key={category} className="mb-2">
        <CardHeader>
          <CardTitle className="text-sm">{category}</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(fields).map(([field, value]) => (
            <div key={field} className="flex justify-between border-b py-1 last:border-b-0">
              <span className="font-medium">{field}:</span>
              <span className="text-gray-600">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    ));
  };

  const renderFilePreview = (result: ScanResult) => {
    const fileType = getFileType(result.fileName);

    if (!result.base64Image) return null;

    if (fileType === 'image') {
      return (
        <img 
          src={`data:image/${result.fileName.split('.').pop()?.toLowerCase()};base64,${result.base64Image}`}
          alt="Scanned Document" 
          className="max-w-full max-h-[400px] object-contain"
        />
      );
    }

    if (fileType === 'pdf') {
      return (
        <iframe
          src={`data:application/pdf;base64,${result.base64Image}`}
          className="w-full h-[500px]"
          title="PDF Preview"
        />
      );
    }

    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p>Preview not available for this file type</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => result.base64Image && handleDownload(result.base64Image, result.fileName)}
        >
          <Download className="w-4 h-4 mr-2" /> Download File
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sensitive Data Scanner</CardTitle>
          <CardDescription>Upload and scan files for sensitive information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="file"
              onChange={handleFileChange}
              className="flex-grow"
            />
            <Button 
              onClick={handleFileUpload} 
              disabled={!file}
              className="min-w-[120px]"
            >
              Scan File
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan Results History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Sensitive Categories</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scanResults.map((result) => (
                <TableRow key={result._id}>
                  <TableCell className="flex items-center space-x-2">
                    {getFileIcon(result.fileName)}
                    <span>{result.fileName}</span>
                  </TableCell>
                  <TableCell>
                    {Object.keys(result.sensitiveData).join(', ')}
                  </TableCell>
                  <TableCell>
                    {new Date(result?.timestamp || Date.now()).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedResult(result);
                              setShowFilePreview(false);
                            }}
                          >
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Sensitive Data Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {!showFilePreview && selectedResult && renderSensitiveDataDetails(selectedResult.sensitiveData)}
                            {showFilePreview && selectedResult && renderFilePreview(selectedResult)}
                          </div>
                          <DialogFooter className="flex justify-between items-center">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilePreview(!showFilePreview)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                {showFilePreview ? 'Show Details' : 'Show File'}
                              </Button>
                              {selectedResult?.base64Image && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(selectedResult.base64Image!, selectedResult.fileName)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              )}
                            </div>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteResult(result._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}