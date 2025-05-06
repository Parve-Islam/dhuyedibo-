 // app/reminder/edit/[id]/page.js - Edit reminder page
 'use client';
  
 import { useState, useEffect } from 'react';
 import { useRouter } from 'next/navigation';
 import Link from 'next/link';
 import ReminderForm from '@/components/ReminderForm';
 
 export default function EditReminderPage({ params }) {
   const [reminder, setReminder] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const router = useRouter();
   const { id } = params;
 
   useEffect(() => {
     const fetchReminder = async () => {
       try {
         const response = await fetch(`/api/reminders/${id}`);
         
         if (!response.ok) {
           throw new Error('Failed to fetch reminder');
         }
         
         const data = await response.json();
         setReminder(data.reminder);
       } catch (err) {
         setError(err.message);
       } finally {
         setIsLoading(false);
       }
     };
 
     if (id) {
       fetchReminder();
     }
   }, [id]);
 
   const handleSubmit = async (formData) => {
     try {
       const response = await fetch(`/api/reminders/${id}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(formData),
       });
 
       if (!response.ok) {
         throw new Error('Failed to update reminder');
       }
 
       router.push('/reminder');
     } catch (err) {
       setError(err.message);
     }
   };
 
   if (isLoading) {
     return (
       <div className="container mx-auto px-4 py-8 max-w-2xl">
         <div className="text-center">Loading reminder...</div>
       </div>
     );
   }
 
   if (error) {
     return (
       <div className="container mx-auto px-4 py-8 max-w-2xl">
         <div className="bg-green-100 border border-red-400 text-red-700 px-4 py-3 rounded">
           {error}
         </div>
         <div className="mt-4">
           <Link href="/" className="text-blue-500 hover:text-blue-700">
             Back to Reminders
           </Link>
         </div>
       </div>
     );
   }
 
   if (!reminder) {
     return (
       <div className="container mx-auto px-4 py-8 max-w-2xl">
         <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
           Reminder not found
         </div>
         <div className="mt-4">
           <Link href="/" className="text-blue-500 hover:text-blue-700">
             Back to Reminders
           </Link>
         </div>
       </div>
     );
   }
 
   return (
     <div className="container mx-auto px-4 py-8 max-w-2xl">
       <div className="flex items-center mb-6">
         <Link href="/" className="text-blue-500 hover:text-blue-700 mr-4">
           ← Back
         </Link>
         <h1 className="text-2xl font-bold">Edit Reminder</h1>
       </div>
       
       <ReminderForm
         initialData={reminder}
         onSubmit={handleSubmit}
       />
     </div>
   );
 }