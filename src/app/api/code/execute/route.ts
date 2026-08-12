import { NextResponse } from 'next/server';

const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';

const LANGUAGE_MAPPING: Record<string, { language: string, versionIndex: string }> = {
  python: { language: 'python3', versionIndex: '0' },
  c: { language: 'c', versionIndex: '0' },
  cpp: { language: 'cpp', versionIndex: '0' },
  java: { language: 'java', versionIndex: '0' },
};

export async function POST(request: Request) {
  try {
    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Server misconfiguration: JDoodle API credentials are not set. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { language, code, stdin, uid } = body;

    // 1. Validation
    if (!language || !code) {
      return NextResponse.json({ error: 'Language and code are required' }, { status: 400 });
    }

    const jdoodleConfig = LANGUAGE_MAPPING[language];
    if (!jdoodleConfig) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    if (code.length > 50000) {
      return NextResponse.json({ error: 'Code size limit exceeded' }, { status: 413 });
    }

    if (stdin && stdin.length > 10000) {
      return NextResponse.json({ error: 'Input size limit exceeded' }, { status: 413 });
    }

    // Auth bypass: we trust the client to send a uid since we don't have firebase-admin
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized: Missing user ID' }, { status: 401 });
    }

    // 2. Submit to JDoodle
    const submitResponse = await fetch(JDOODLE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        script: code,
        stdin: stdin || '',
        language: jdoodleConfig.language,
        versionIndex: jdoodleConfig.versionIndex,
        compileOnly: false
      }),
    });

    if (submitResponse.status === 401 || submitResponse.status === 429) {
      const data = await submitResponse.json().catch(() => ({}));
      // Check for JDoodle credit limit or auth errors
      if (submitResponse.status === 429 || (data.error && data.error.toLowerCase().includes('limit'))) {
         return NextResponse.json(
           { error: 'Code execution limit reached. Please try again later.' },
           { status: 429 }
         );
      }
      return NextResponse.json(
        { error: 'Execution service authentication failed or limit reached.' },
        { status: 500 }
      );
    }

    if (!submitResponse.ok) {
      throw new Error(`JDoodle API submission failed: ${submitResponse.status}`);
    }

    const resultData = await submitResponse.json();

    // Handle JDoodle's internal credit limit indicator if returned with 200 OK
    if (resultData.error && String(resultData.error).toLowerCase().includes('daily limit reached')) {
      return NextResponse.json(
        { error: 'Code execution limit reached. Please try again later.' },
        { status: 429 }
      );
    }

    // 3. Normalize Response
    let finalStatus = 'error';
    let stdout = '';
    let stderr = '';

    // JDoodle returns statusCode 200 for successful execution, compilation errors, and some runtime errors.
    // If output contains compilation error indicators or memory/cpu is not normally populated, it might be an error.
    if (resultData.statusCode === 200) {
      finalStatus = 'success';
      stdout = resultData.output;
    } else if (resultData.statusCode === 400 || resultData.statusCode === 404 || resultData.error) {
      finalStatus = 'compile_error';
      stderr = resultData.error || resultData.output || 'Compilation failed.';
    } else {
      finalStatus = 'error';
      stderr = resultData.error || resultData.output || 'Unknown execution error.';
    }

    // To better handle JDoodle's stdout / stderr separation (which is basically non-existent, it puts everything in output):
    // For compile errors JDoodle usually sets statusCode to something else, but sometimes throws exceptions into output.
    // We can just rely on the API response structure.
    
    // Some basic heuristics if JDoodle sets statusCode 200 but it's an obvious exception:
    if (resultData.statusCode === 200 && resultData.output) {
        const outLower = resultData.output.toLowerCase();
        if (outLower.includes('exception in thread') || outLower.includes('traceback (most recent call last):') || outLower.includes('segmentation fault')) {
             finalStatus = 'runtime_error';
             stderr = resultData.output;
             stdout = '';
        }
    }

    return NextResponse.json({
      status: finalStatus,
      stdout: stdout,
      stderr: stderr,
      executionTime: resultData.cpuTime ? parseFloat(resultData.cpuTime) * 1000 : 0,
    });

  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: 'Code execution is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
