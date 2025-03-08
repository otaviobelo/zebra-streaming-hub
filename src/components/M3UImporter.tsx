
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Upload, FileUp, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { processM3UContent } from '@/utils/m3uParser';
import { addChannel, saveChannels } from '@/utils/channelData';
import { Channel } from '@/lib/types';

interface M3UImporterProps {
  onImportComplete?: () => void;
}

export interface M3UImporterRef {
  handleDirectImport: (m3uContent: string) => Promise<void>;
}

const M3UImporter = forwardRef<M3UImporterRef, M3UImporterProps>(({ onImportComplete }, ref) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processedChannels, setProcessedChannels] = useState<Omit<Channel, "id" | "isFavorite" | "channelNumber">[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    handleDirectImport: async (m3uContent: string) => {
      await handleDirectImport(m3uContent);
    }
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const processFile = async () => {
    if (!file) {
      setErrorMessage('Por favor, selecione um arquivo M3U para importar.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const content = await file.text();
      const channels = processM3UContent(content);
      
      if (channels.length === 0) {
        setErrorMessage('Não foram encontrados canais válidos no arquivo.');
        toast({
          title: "Erro ao processar arquivo",
          description: "Não foram encontrados canais válidos no arquivo M3U.",
          variant: "destructive",
        });
      } else {
        setProcessedChannels(channels);
        toast({
          title: "Arquivo processado",
          description: `${channels.length} canais foram encontrados no arquivo.`,
        });
      }
    } catch (error) {
      console.error('Erro ao processar arquivo M3U:', error);
      setErrorMessage('Ocorreu um erro ao processar o arquivo M3U.');
      toast({
        title: "Erro ao processar arquivo",
        description: "Ocorreu um erro ao analisar o arquivo M3U.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const importChannels = async () => {
    if (processedChannels.length === 0) {
      setErrorMessage('Não há canais para importar.');
      return;
    }

    setIsProcessing(true);
    try {
      // Adicionar cada canal à base de dados
      const importPromises = processedChannels.map(channel => 
        addChannel(channel)
      );
      
      await Promise.all(importPromises);
      
      toast({
        title: "Importação concluída",
        description: `${processedChannels.length} canais foram importados com sucesso.`,
      });
      
      // Limpar estado
      setFile(null);
      setProcessedChannels([]);
      
      // Notificar componente pai
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Erro ao importar canais:', error);
      setErrorMessage('Ocorreu um erro ao importar os canais.');
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os canais para o banco de dados.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectImport = async (m3uContent: string) => {
    setIsProcessing(true);
    try {
      const channels = processM3UContent(m3uContent);
      
      if (channels.length === 0) {
        toast({
          title: "Erro ao processar conteúdo",
          description: "Não foram encontrados canais válidos no conteúdo M3U fornecido.",
          variant: "destructive",
        });
        return;
      }
      
      // Adicionar cada canal à base de dados
      const importPromises = channels.map(channel => 
        addChannel(channel)
      );
      
      await Promise.all(importPromises);
      
      toast({
        title: "Importação direta concluída",
        description: `${channels.length} canais foram importados com sucesso.`,
      });
      
      // Notificar componente pai
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Erro ao importar canais diretamente:', error);
      toast({
        title: "Erro na importação direta",
        description: "Ocorreu um erro ao importar os canais para o banco de dados.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelImport = () => {
    setFile(null);
    setProcessedChannels([]);
    setErrorMessage(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Lista IPTV (M3U)
        </CardTitle>
        <CardDescription>
          Carregue um arquivo .m3u ou .m3u8 para importar canais automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {processedChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800">
            <input
              type="file"
              id="m3u-file"
              accept=".m3u,.m3u8,text/plain"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <label
              htmlFor="m3u-file"
              className="flex flex-col items-center justify-center w-full h-32 cursor-pointer"
            >
              <FileUp className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                {file ? file.name : 'Clique para selecionar um arquivo M3U'}
              </p>
              {file && (
                <Badge variant="secondary" className="mt-2">
                  {Math.round(file.size / 1024)} KB
                </Badge>
              )}
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Canais encontrados</h3>
              <Badge>{processedChannels.length}</Badge>
            </div>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2">
              <ul className="space-y-1">
                {processedChannels.map((channel, index) => (
                  <li key={index} className="text-sm py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
                    {channel.logoUrl && (
                      <img 
                        src={channel.logoUrl} 
                        alt="" 
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="flex-1 truncate">{channel.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {channel.category}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {processedChannels.length === 0 ? (
          <>
            <Button variant="outline" onClick={cancelImport} disabled={!file || isProcessing}>
              Cancelar
            </Button>
            <Button onClick={processFile} disabled={!file || isProcessing}>
              {isProcessing ? 'Processando...' : 'Processar Arquivo'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={cancelImport} disabled={isProcessing}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={importChannels} disabled={isProcessing}>
              <Check className="h-4 w-4 mr-2" />
              {isProcessing ? 'Importando...' : 'Importar Canais'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
});

// Set display name for debugging
M3UImporter.displayName = 'M3UImporter';

export default M3UImporter;
