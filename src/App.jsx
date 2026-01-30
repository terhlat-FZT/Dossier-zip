 import { useState} from 'react'
import* as XLSX from 'xlsx';
import './App.css'
import JSZip from "jszip";
function App() {
 const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState(null); // null pour les objets

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setStatus("Lecture du fichier...");
    setProgress(0);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const donnees = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (!donnees.length || donnees[0].length !== 2) {
        alert("Le fichier doit contenir exactement 2 colonnes.");
        setIsUploading(false);
        setStatus("");
        return;
      }

      const headers = donnees.shift(); // retirer la ligne d'en-tête
      console.log("En-têtes détectés :", headers);

      const resultats = [];

      for (let index = 0; index < donnees.length; index++) {
        const row = donnees[index];
        const col1 = row[0];
        const col2 = row[1];

        if (col1 != null && col1 !== "" && col2 != null && col2 !== "") {
          resultats.push(`${col1}-${col2}`);
          console.log(`Ligne ${index + 1} ajoutée : ${col1}-${col2}`);
        } else {
          alert(
            `Erreur à la ligne ${index + 2} : Une donnée est vide (${col1 || "vide"} / ${col2 || "vide"}).`
          );
          setIsUploading(false);
          setStatus("Erreur : Fichier incomplet");
          setData(null);
          return;
        }
      }

      setData(resultats);
      setStatus(`✅ ${file.name} chargé`);
      setProgress(100);

      // Générer et télécharger le ZIP
      const zip = new JSZip();
      const parentFolder = zip.folder("Mes_Dossiers");

      resultats.forEach((nom) => {
         parentFolder.folder(nom);
        
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mes_dossiers.zip";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (error) {
      console.error("Erreur :", error);
      setStatus("Erreur de lecture");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <div className={`upload-box ${isUploading ? 'active' : ''}`} id="drop-zone">
        <div className="icon-wrapper">
          <span className="zip-icon">📦</span>
        </div>
        
        <div style={{ color: "black" }}>
          <h1>Créer un dossier ZIP</h1>
          <p>Glissez votre fichier Excel ici ou cliquez pour parcourir</p>
        </div>

        <label htmlFor="avatar" className="btn-upload">
          {isUploading ? "Changer de fichier" : "Sélectionner un fichier Excel"}
        </label>
        <input 
          type="file" 
          id="avatar" 
          name="avatar" 
          accept=".xls,.xlsx" 
          onChange={handleFileChange}
        />
        
        <div id="loading-bar" className="progress-container" style={{ display: isUploading ? 'block' : 'none' }}>
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        
        <p id="status-text" style={{color:"black"}}>{status}</p>
      </div>
    </div>
  );
};
export default App
