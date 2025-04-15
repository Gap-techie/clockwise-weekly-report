import { supabase } from '@/lib/supabaseClient'; // adjust this import path as per your project

const validateJobCode = async (
  projectId: string,
  code: string
): Promise<string | null> => {
  try {
    if (!code.trim()) {
      return "Job code is required";
    }

    console.log('Validating job code:', {
      projectId,
      code: code.trim(),
      timestamp: new Date().toISOString(),
    });

    const { data: availableJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, code')
      .eq('is_active', true);

    if (jobsError) {
      console.error('Error fetching available jobs:', jobsError);
      throw jobsError;
    }

    console.log('Available jobs for project:', {
      projectId,
      jobs: availableJobs?.map((j) => j.code) || [],
    });

    const { data, error } = await supabase
      .from('jobs')
      .select('id, code, title')
      .ilike('code', code.trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Database error during job code validation:', error);
      throw error;
    }

    console.log('Job code validation result:', {
      projectId,
      searchedCode: code.trim(),
      found: !!data,
      matchedJob: data,
    });

    if (!data) {
      const availableCodes = availableJobs?.map((j) => j.code).join(', ') || 'none';
      console.log(`No matching job code found. Available codes: ${availableCodes}`);
      return `Invalid job code. Available codes: ${availableCodes}`;
    }

    return null;
  } catch (error) {
    console.error('Error validating job code:', error);
    return "Error validating job code. Please try again.";
  }
};

export default validateJobCode;
