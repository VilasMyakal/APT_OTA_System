import { Upload, X } from 'lucide-react';
import Select from 'react-select';
import '../pages/react-select-tailwind.css';

const UploadFirmwareModal = ({
  show,
  onClose,
  deviceOptions,
  selectedDevice,
  setSelectedDevice,
  version,
  setVersion,
  description,
  setDescription,
  file,
  setFile,
  fileInputRef,
  handleDrop,
  handleFileChange,
  handleUpload
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-0 w-full max-w-2xl relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-7 w-7" />
        </button>
        <div className="flex flex-col md:flex-row gap-0 md:gap-8 p-8">
          {/* File Upload Area */}
          <div className="flex-1 flex flex-col items-center justify-center mb-6 md:mb-0 md:pr-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 self-start">Upload Firmware</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 self-start">Drag and drop a file or click to select.</p>
            <div
              className="w-full h-44 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition mb-2"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              {file ? (
                <span className="text-blue-700 dark:text-blue-300 font-medium text-base">{file.name}</span>
              ) : (
                <>
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-base">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">.BIN, .HEX, or .IMG files</span>
                </>
              )}
              <input
                type="file"
                accept=".bin,.hex,.img"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </div>
          {/* Fields Area */}
          <form onSubmit={handleUpload} className="flex-1 flex flex-col justify-center gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
                <input
                  type="text"
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  placeholder="e.g., v1.2.4"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  className="w-full h-12 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base"
                  placeholder="Brief description of changes"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device</label>
                <Select
                  options={deviceOptions}
                  value={selectedDevice}
                  onChange={setSelectedDevice}
                  isSearchable
                  placeholder="Select device..."
                  classNamePrefix="react-select"
                  className="react-select-container w-full h-12"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '3rem',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: 'inherit',
                    })
                  }}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full h-12 mt-2 px-6 py-2 rounded-lg bg-blue-600 text-white text-base font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={!selectedDevice || !version || !file}
            >
              <Upload className="h-5 w-5 mr-1 inline" /> Upload Firmware
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadFirmwareModal; 