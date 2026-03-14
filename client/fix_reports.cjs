const fs = require('fs');
const content = fs.readFileSync('src/pages/Reports.jsx', 'utf-8');

let newContent = content;

// 1. Remove patientName and setPatientName
newContent = newContent.replace(/const \[patientName, setPatientName\] = useState\(''\);\n\s*/, '');

// 2. Fix fetchReports hoisting
const fetchReportsCode = `    const fetchReports = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/reports', { withCredentials: true });
            setReports(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load reports');
        }
    }, []);\n\n`;

newContent = newContent.replace(/    useEffect\(\(\) => \{\n        if \(!user\) navigate\('\/login'\);\n        fetchReports\(\);\n    \}, \[user, navigate\]\);\n\n    const fetchReports = async \(\) => \{\n        try \{\n            const res = await axios\.get\('http:\/\/localhost:5000\/api\/reports', \{ withCredentials: true \}\);\n            setReports\(res\.data\);\n        \} catch \(err\) \{\n            console\.error\(err\);\n            toast\.error\('Failed to load reports'\);\n        \}\n    \};\n/, fetchReportsCode + `    useEffect(() => {
        if (!user) navigate('/login');
        fetchReports();
    }, [user, navigate, fetchReports]);\n`);

// 3. Fix handleUpload and handleNotifyDoctor
const handleNotifyAndUploadCode = `    const handleNotifyDoctor = useCallback(async () => {
        try {
            toast.success('Doctor notified (Simulated)');
        } catch (error) {
            toast.error('Failed to notify');
        }
    }, []);\n\n    const handleUpload = useCallback(async (e) => {
        e.preventDefault();

        if (!fileInputRef.current.files[0]) {
            dispatch({ type: 'ERROR', payload: 'Please select a file' });
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInputRef.current.files[0]);
        formData.append('patientName', user?.name || 'Unknown'); 
        formData.append('category', category);
        formData.append('notes', notes);
        formData.append('visibility', visibility);

        dispatch({ type: 'START' });

        try {
            await axios.post('http://localhost:5000/api/reports', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            dispatch({ type: 'SUCCESS', payload: 'Report uploaded successfully!' });
            toast.success('Report uploaded!');
            fetchReports();
            setCategory('General');
            setNotes('');
            setVisibility('Private');
            fileInputRef.current.value = '';

            if (window.confirm('Report Uploaded! Do you want to notify your assigned doctor?')) {
                handleNotifyDoctor();
            }

        } catch (error) {
            dispatch({ type: 'ERROR', payload: error.response?.data?.message || 'Upload failed' });
            toast.error('Upload failed');
        }
    }, [category, notes, visibility, user, fetchReports, handleNotifyDoctor]);\n`;

const oldUploadStr = `    const handleUpload = useCallback(async (e) => {
        e.preventDefault();

        if (!fileInputRef.current.files[0]) {
            dispatch({ type: 'ERROR', payload: 'Please select a file' });
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInputRef.current.files[0]);
        formData.append('patientName', user?.name || 'Unknown'); 
        formData.append('category', category);
        formData.append('notes', notes);
        formData.append('visibility', visibility);

        dispatch({ type: 'START' });

        try {
            await axios.post('http://localhost:5000/api/reports', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            dispatch({ type: 'SUCCESS', payload: 'Report uploaded successfully!' });
            toast.success('Report uploaded!');
            fetchReports();
            setCategory('General');
            setNotes('');
            setVisibility('Private');
            fileInputRef.current.value = '';

            if (window.confirm('Report Uploaded! Do you want to notify your assigned doctor?')) {
                handleNotifyDoctor();
            }

        } catch (err) {
            dispatch({ type: 'ERROR', payload: err.response?.data?.message || 'Upload failed' });
            toast.error('Upload failed');
        }
    }, [category, notes, visibility, user]);

    const handleNotifyDoctor = async () => {
        try {

            toast.success('Doctor notified (Simulated)');
        } catch (e) {
            toast.error('Failed to notify');
        }
    };\n`;

newContent = newContent.replace(oldUploadStr, handleNotifyAndUploadCode);

// 4. Fix delete err and update err
newContent = newContent.replace(`        } catch (err) {
            console.error(err);
            toast.error('Failed to delete report');
        }`, `        } catch (error) {
            console.error(error);
            toast.error('Failed to delete report');
        }`);
        
newContent = newContent.replace(`        } catch (err) {
            toast.error('Failed to update report');
        }`, `        } catch (error) {
            toast.error('Failed to update report');
        }`);

fs.writeFileSync('src/pages/Reports.jsx', newContent);
console.log('Fixed Reports.jsx');
